import type { AdminViewServerProps } from "payload";
import type { Where } from "payload";

import { Gutter } from "@payloadcms/ui";
import Link from "next/link";

type StatusFilter = "all" | "published" | "draft" | "scheduled";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildPostWhere({
  status,
  q,
  categoryId,
  now,
}: {
  status: StatusFilter;
  q?: string;
  categoryId?: number;
  now: string;
}): Where {
  const and: Where[] = [];

  if (status === "published") and.push({ _status: { equals: "published" } });
  if (status === "draft") and.push({ _status: { equals: "draft" } });
  if (status === "scheduled") {
    and.push({ _status: { equals: "draft" } });
    and.push({ publishedAt: { greater_than: now } });
  }
  if (categoryId) and.push({ category: { equals: categoryId } });
  if (q) {
    and.push({
      or: [
        { title: { like: q } },
        { slug: { like: q } },
        { excerpt: { like: q } },
      ],
    });
  }

  if (and.length === 0) return {};
  if (and.length === 1) return and[0];
  return { and };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status?: string | null) {
  const label = status === "published" ? "Published" : status === "draft" ? "Draft" : "—";
  const color =
    status === "published"
      ? { background: "#E7F5DA", color: "#3F7A1B" }
      : status === "draft"
      ? { background: "#FFF4D6", color: "#8A6100" }
      : { background: "#EEEEEE", color: "#555" };
  return (
    <span
      style={{
        ...color,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </span>
  );
}

function relatedName(value: unknown): string {
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name?: unknown }).name ?? "");
  }
  return "";
}

export async function Dashboard(props: AdminViewServerProps) {
  const { payload, user, searchParams } = props;

  const resolved = await Promise.resolve(searchParams ?? {});
  const q = firstValue(resolved.q)?.trim() || undefined;
  const statusParam = firstValue(resolved.status);
  const status: StatusFilter = (
    ["published", "draft", "scheduled"].includes(statusParam ?? "")
      ? statusParam
      : "all"
  ) as StatusFilter;
  const categoryParam = firstValue(resolved.category);
  const now = new Date().toISOString();

  const access = { overrideAccess: false, user };

  // The filter select submits a category slug, but the relationship query
  // needs the numeric ID. Resolve it before building the where clause.
  const categories = await payload.find({
    collection: "categories",
    limit: 100,
    sort: "name",
    depth: 0,
    ...access,
  });
  const categoryId = categoryParam
    ? categories.docs.find((category) => category.slug === categoryParam)?.id
    : undefined;

  const [
    postsTotal,
    postsPublished,
    postsDrafts,
    postsScheduled,
    answersTotal,
    answersPublished,
    mediaTotal,
    posts,
    answers,
  ] = await Promise.all([
    // Counts use find({ limit: 0 }) instead of count() so they read the same
    // draft-aware data as the tables below; count() has no draft option.
    payload.find({ collection: "posts", limit: 0, draft: true, ...access }),
    payload.find({
      collection: "posts",
      limit: 0,
      draft: true,
      where: { _status: { equals: "published" } },
      ...access,
    }),
    payload.find({
      collection: "posts",
      limit: 0,
      draft: true,
      where: { _status: { equals: "draft" } },
      ...access,
    }),
    payload.find({
      collection: "posts",
      limit: 0,
      draft: true,
      where: {
        _status: { equals: "draft" },
        publishedAt: { greater_than: now },
      },
      ...access,
    }),
    payload.find({ collection: "answers", limit: 0, draft: true, ...access }),
    payload.find({
      collection: "answers",
      limit: 0,
      draft: true,
      where: { _status: { equals: "published" } },
      ...access,
    }),
    payload.count({ collection: "media", ...access }),
    payload.find({
      collection: "posts",
      limit: 25,
      sort: "-updatedAt",
      depth: 1,
      // Autosave stores unpublished edits in the versions table. Without this
      // the table shows drafts with empty title/category/author columns.
      draft: true,
      where: buildPostWhere({ status, q, categoryId, now }),
      ...access,
    }),
    payload.find({
      collection: "answers",
      limit: 25,
      sort: "-updatedAt",
      depth: 1,
      draft: true,
      ...access,
    }),
  ]);

  const statCards = [
    { label: "Posts", value: postsTotal.totalDocs },
    { label: "Published", value: postsPublished.totalDocs },
    { label: "Drafts", value: postsDrafts.totalDocs },
    { label: "Scheduled", value: postsScheduled.totalDocs },
    { label: "Answers", value: answersTotal.totalDocs },
    { label: "Published answers", value: answersPublished.totalDocs },
    { label: "Media", value: mediaTotal.totalDocs },
  ];

  return (
    <Gutter>
      <div style={{ paddingBottom: 48 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>
            Content overview
          </h1>

          {/* Stat cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {statCards.map((stat) => (
              <div
                key={stat.label}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                  padding: "16px 18px",
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 4, fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            <Link
              href="/admin/collections/posts/create"
              style={{ padding: "8px 14px", borderRadius: 8, background: "#1C1C1C", color: "#fff", fontWeight: 600, fontSize: 13 }}
            >
              New post
            </Link>
            <Link
              href="/admin/collections/answers/create"
              style={{ padding: "8px 14px", borderRadius: 8, background: "#75C043", color: "#1C1C1C", fontWeight: 700, fontSize: 13 }}
            >
              New answer
            </Link>
            <Link
              href="/admin/collections/media"
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontWeight: 600 }}
            >
              Media
            </Link>
            <Link
              href="/blog"
              target="_blank"
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontWeight: 600 }}
            >
              View blog ↗
            </Link>
            <Link
              href="/answers"
              target="_blank"
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, fontWeight: 600 }}
            >
              View answers ↗
            </Link>
          </div>

          {/* Posts */}
          <section style={{ marginBottom: 40 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>All posts</h2>
              <form method="get" action="/admin" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {status !== "all" && <input type="hidden" name="status" value={status} />}
                {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search posts…"
                  style={{ padding: "7px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, minWidth: 200 }}
                />
                <button
                  type="submit"
                  style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Search
                </button>
              </form>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {STATUS_TABS.map((tab) => {
                  const params = new URLSearchParams();
                  if (tab.value !== "all") params.set("status", tab.value);
                  if (q) params.set("q", q);
                  if (categoryParam) params.set("category", categoryParam);
                  const query = params.toString();
                  return (
                    <Link
                      key={tab.value}
                      href={query ? `/admin?${query}` : "/admin"}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid #ddd",
                        background: status === tab.value ? "#1C1C1C" : "#fff",
                        color: status === tab.value ? "#fff" : "#333",
                      }}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>

              <form method="get" action="/admin" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {q && <input type="hidden" name="q" value={q} />}
                {status !== "all" && <input type="hidden" name="status" value={status} />}
                <select
                  name="category"
                  defaultValue={categoryParam ?? ""}
                  style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13 }}
                >
                  <option value="">All categories</option>
                  {categories.docs.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Filter
                </button>
              </form>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #e5e5e5", borderRadius: 10, background: "#fff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#FAFAFA" }}>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Title</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Category</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Author</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Published</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Updated</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }} />
                  </tr>
                </thead>
                <tbody>
                  {posts.docs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "24px 14px", color: "#666", textAlign: "center" }}>
                        No posts match these filters.
                      </td>
                    </tr>
                  ) : (
                    posts.docs.map((post) => (
                      <tr key={post.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                          <Link href={`/admin/collections/posts/${post.id}`} style={{ color: "#1C1C1C" }}>
                            {post.title}
                          </Link>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{relatedName(post.category) || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{relatedName(post.author) || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>{statusBadge(post._status)}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{formatDate(post.publishedAt)}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{formatDate(post.updatedAt)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <Link href={`/admin/collections/posts/${post.id}`} style={{ fontWeight: 600, marginRight: 12 }}>
                            Edit
                          </Link>
                          <Link href={`/blog/${post.slug}`} target="_blank" style={{ color: "#5DA233", fontWeight: 600 }}>
                            View ↗
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, textAlign: "right" }}>
              <Link href="/admin/collections/posts" style={{ fontWeight: 600, fontSize: 13 }}>
                View all posts →
              </Link>
            </div>
          </section>

          {/* Answers */}
          <section>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Answers</h2>
              <Link href="/admin/collections/answers/create" style={{ fontWeight: 600, fontSize: 13 }}>
                New answer →
              </Link>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #e5e5e5", borderRadius: 10, background: "#fff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#FAFAFA" }}>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Question</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Category</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Featured</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }}>Updated</th>
                    <th style={{ padding: "10px 14px", fontWeight: 700 }} />
                  </tr>
                </thead>
                <tbody>
                  {answers.docs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "24px 14px", color: "#666", textAlign: "center" }}>
                        No answers yet.
                      </td>
                    </tr>
                  ) : (
                    answers.docs.map((answer) => (
                      <tr key={answer.id} style={{ borderTop: "1px solid #eee" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                          <Link href={`/admin/collections/answers/${answer.id}`} style={{ color: "#1C1C1C" }}>
                            {answer.question}
                          </Link>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{relatedName(answer.category) || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{answer.featured ? "Yes" : "—"}</td>
                        <td style={{ padding: "10px 14px" }}>{statusBadge(answer._status)}</td>
                        <td style={{ padding: "10px 14px", color: "#555" }}>{formatDate(answer.updatedAt)}</td>
                        <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <Link href={`/admin/collections/answers/${answer.id}`} style={{ fontWeight: 600, marginRight: 12 }}>
                            Edit
                          </Link>
                          <Link href={`/answers/${answer.slug}`} target="_blank" style={{ color: "#5DA233", fontWeight: 600 }}>
                            View ↗
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, textAlign: "right" }}>
              <Link href="/admin/collections/answers" style={{ fontWeight: 600, fontSize: 13 }}>
                View all answers →
              </Link>
            </div>
          </section>
      </div>
    </Gutter>
  );
}
