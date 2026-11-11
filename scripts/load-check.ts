/**
 * Lightweight load check for the CMS-backed public pages.
 *
 * Usage:
 *   bun run build && bun run start        # or an existing deployment
 *   bun run perf                          # defaults to http://localhost:3000
 *   LOAD_TEST_URL=https://staging.ugle.ai LOAD_ASSERT=1 bun run perf
 *
 * It measures p50/p95 latency and the error rate for `/blog`, `/answers` and
 * one real `/blog/[slug]` page discovered from the sitemap.
 */

const BASE_URL = (process.env.LOAD_TEST_URL ?? "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const DURATION_MS = Number(process.env.LOAD_DURATION_MS ?? 15_000);
const CONCURRENCY = Math.max(1, Number(process.env.LOAD_CONCURRENCY ?? 10));
const ASSERT = process.env.LOAD_ASSERT === "1";
const P95_BUDGET_MS = Number(process.env.LOAD_P95_BUDGET_MS ?? 2_000);
const MAX_ERROR_RATE = Number(process.env.LOAD_MAX_ERROR_RATE ?? 0.01);

type Sample = { ok: boolean; ms: number; status: number };
type PathStats = {
  path: string;
  samples: Sample[];
};

async function discoverPostPath(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await res.text();
    const match = xml.match(/<loc>([^<]*\/blog\/[^<]+)<\/loc>/);
    if (match) {
      return new URL(match[1]).pathname;
    }
  } catch {
    // Fall through to the index-only run.
  }
  return "/blog";
}

async function hit(path: string): Promise<Sample> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "user-agent": "ugle-load-check" },
    });
    await res.arrayBuffer();
    return { ok: res.ok, ms: performance.now() - start, status: res.status };
  } catch (error) {
    if (process.env.LOAD_DEBUG === "1") {
      console.error(error);
    }
    return { ok: false, ms: performance.now() - start, status: 0 };
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function summarise(stats: PathStats) {
  const latencies = stats.samples.map((sample) => sample.ms);
  const errors = stats.samples.filter((sample) => !sample.ok).length;
  return {
    path: stats.path,
    requests: stats.samples.length,
    rps: stats.samples.length / (DURATION_MS / 1000),
    errorRate: stats.samples.length === 0 ? 0 : errors / stats.samples.length,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    max: Math.max(0, ...latencies),
  };
}

function formatRow(row: ReturnType<typeof summarise>): string {
  return [
    row.path.padEnd(34),
    String(row.requests).padStart(6),
    row.rps.toFixed(1).padStart(7),
    `${(row.errorRate * 100).toFixed(2)}%`.padStart(8),
    `${row.p50.toFixed(0)}ms`.padStart(8),
    `${row.p95.toFixed(0)}ms`.padStart(8),
    `${row.max.toFixed(0)}ms`.padStart(8),
  ].join(" ");
}

async function main() {
  const postPath = await discoverPostPath();
  const paths = ["/blog", postPath, "/answers"];

  // Warm up caches and the database pool before measuring.
  await Promise.all(paths.map((path) => hit(path)));

  const stats: PathStats[] = paths.map((path) => ({ path, samples: [] }));
  const deadline = performance.now() + DURATION_MS;

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async (_, worker) => {
      let cursor = worker;
      while (performance.now() < deadline) {
        const index = cursor % paths.length;
        cursor += 1;
        stats[index].samples.push(await hit(paths[index]));
      }
    }),
  );

  const rows = stats.map(summarise);

  console.log(
    `\nLoad check: ${BASE_URL} (${CONCURRENCY} workers, ${DURATION_MS / 1000}s)\n`,
  );
  console.log(
    [
      "path".padEnd(34),
      "reqs".padStart(6),
      "rps".padStart(7),
      "errors".padStart(8),
      "p50".padStart(8),
      "p95".padStart(8),
      "max".padStart(8),
    ].join(" "),
  );
  for (const row of rows) {
    console.log(formatRow(row));
  }
  console.log("");

  if (!ASSERT) return;

  const failures = rows.filter(
    (row) => row.errorRate > MAX_ERROR_RATE || row.p95 > P95_BUDGET_MS,
  );

  if (failures.length > 0) {
    console.error(
      `Load budget exceeded (p95 <= ${P95_BUDGET_MS}ms, errors <= ${
        MAX_ERROR_RATE * 100
      }%):`,
    );
    for (const row of failures) {
      console.error(`- ${row.path}: p95 ${row.p95.toFixed(0)}ms, errors ${(row.errorRate * 100).toFixed(2)}%`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
