# Ugle CMS — operations runbook

This document covers running, deploying, backing up and recovering the Ugle
CMS. For day-to-day editing see [`editor-guide.md`](./editor-guide.md).

## Architecture

- **Next.js 16** app (App Router) with the public site in `app/(site)` and the
  CMS/admin/API in `app/(payload)`.
- **Payload CMS 3.93** embedded in the same app. Admin at `/admin`, REST API at
  `/api`, GraphQL at `/api/graphql`.
- **Postgres** for content, users and versions.
- **Vercel Blob** for media in production. Without `BLOB_READ_WRITE_TOKEN`
  (local development and tests) Payload writes to the local `media/` folder.
- **Vercel** hosts the app. The public pages are statically generated with
  on-demand revalidation triggered by Payload hooks.

```
Browser ──► Vercel / Next.js ──► Payload Local API ──► Postgres
                    │                    │
                    └── /blog /answers   └── Vercel Blob (media)
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URI` | Yes | Postgres connection string. |
| `PAYLOAD_SECRET` | Yes | Signs Payload auth tokens. Rotating it logs everyone out. |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Public origin, used for CSRF/CORS, absolute URLs and preview links. |
| `PREVIEW_SECRET` | Yes | Shared secret for `/api/preview`. Preview is disabled if unset. |
| `CRON_SECRET` | Yes | Bearer token for scheduled-publish jobs. |
| `BLOB_READ_WRITE_TOKEN` | Production | Enables Vercel Blob storage. Unset = local disk. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Seed only | First admin account created by `bun run seed`. |
| `TURNSTILE_*`, `RESEND_*`, `GOOGLE_*` | Existing | Contact/newsletter/sheets features, unrelated to the CMS. |

Generate secrets with a password manager or `openssl rand -base64 48`. Never
commit them; `.env.local` is gitignored.

## Local development

```bash
# 1. Start Postgres (Docker)
docker run -d --name ugle-postgres \
  -e POSTGRES_USER=ugle -e POSTGRES_PASSWORD=ugle -e POSTGRES_DB=ugle \
  -p 5432:5432 postgres:17

# 2. Configure .env.local (see table above)

# 3. Install and start
bun install
bun run dev            # http://localhost:3000
```

Payload pushes schema changes automatically outside production
(`db.push: NODE_ENV !== "production"`), so a fresh local database needs no
migration. To create one anyway:

```bash
bun run migrate
bun run seed           # categories, authors, answers, demo post, admin user
```

Useful commands:

| Command | What it does |
|---------|--------------|
| `bun run generate:types` | Regenerate `payload-types.ts` after schema changes. |
| `bun run generate:importmap` | Regenerate the admin import map after adding custom components. |
| `bun run migrate:create` | Create a new migration from the current schema. |
| `bun run test` | Unit tests (no database). |
| `bun run test:integration` | Payload + Postgres integration tests (creates `ugle_test`). |
| `bun run test:e2e` | Playwright E2E (public specs read-only; admin specs need `E2E_ADMIN=1`). |
| `bun run perf` | Load check against `LOAD_TEST_URL` (default `http://localhost:3000`). |

## Production cutover checklist

1. **Provision Postgres** (Vercel Postgres/Neon or equivalent). Enable
   point-in-time recovery if available.
2. **Provision a Vercel Blob store** and copy its read/write token.
3. **Set all environment variables** in Vercel for Production (and Preview).
   Set `NEXT_PUBLIC_SERVER_URL` to the final public origin.
4. **Run migrations** against the production database:
   ```bash
   DATABASE_URI=... PAYLOAD_SECRET=... bun run migrate
   ```
   `payload.config.ts` disables schema push in production, so this step is
   mandatory.
5. **Seed** the first admin, categories, authors, answers and demo content:
   ```bash
   DATABASE_URI=... PAYLOAD_SECRET=... \
   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... bun run seed
   ```
   The seed is idempotent (matched by slug/email/filename).
6. **Build and deploy** the current commit to Vercel. Confirm the build log
   shows the environment check passing.
7. **Smoke test**:
   - `/blog` lists posts and **Load more** works.
   - `/blog/<slug>` renders metadata, canonical and JSON-LD.
   - `/answers` and `/answers/<slug>` render.
   - `/sitemap.xml`, `/robots.txt`, `/blog/rss.xml` and `/llms.txt` respond.
   - `/admin` loads with Ugle branding and the admin can sign in.
   - Upload an image and confirm the URL points at the Blob host, not
     `/api/media/file/...`.
   - Open a draft in **Preview**; confirm it is `noindex`.
8. **DNS**: point the domain at Vercel and set `NEXT_PUBLIC_SERVER_URL` to the
   canonical origin. Redeploy after changing it so CSRF/CORS and absolute URLs
   update.
9. **Remove the demo post** if it should not be public
   (`/admin/collections/posts` → trash).
10. **Monitor for 48 hours** (see Monitoring).

### Rollback

- **Application regression:** promote the previous Vercel deployment. The
  database is unchanged, so content keeps working.
- **Schema/data incident:** stop writes, restore the most recent dump into a
  fresh database, point `DATABASE_URI` at it and redeploy. Migrations are
  forward-only; do not attempt to run `down` on production without a tested
  plan.
- **Bad content change:** unpublish or restore the document version from the
  admin (**Versions** panel). No deploy needed.

## Backups and restore drill

Take a compressed custom-format dump:

```bash
pg_dump -Fc "$DATABASE_URI" -f ugle-$(date +%F).dump
```

Restore into a separate database first, never over the live one:

```bash
createdb -T template0 ugle_restore_check
pg_restore -d ugle_restore_check ugle-2026-11-11.dump
```

Verify row counts match before trusting the dump:

```sql
select 'posts='||count(*) from posts
union all select 'answers='||count(*) from answers
union all select 'media='||count(*) from media
union all select 'categories='||count(*) from categories
union all select 'authors='||count(*) from authors
union all select 'users='||count(*) from users
union all select 'post_versions='||count(*) from _posts_v
union all select 'answer_versions='||count(*) from _answers_v;
```

The last drill restored into `ugle_restore_check` and matched exactly
(posts 18, answers 6, media 20, categories 10, authors 1, users 1, post
versions 22, answer versions 9). Drop the check database and dump afterwards.

Schedule daily automated backups (provider snapshots or a cron job running
`pg_dump`) and keep at least 14 days of retention. Media is stored in Vercel
Blob, which is backed up separately by the provider; a database dump alone does
not contain the files.

## Secret rotation

| Secret | Procedure | Impact |
|--------|-----------|--------|
| `PAYLOAD_SECRET` | Generate a new value, update Vercel, redeploy. | All admin sessions are invalidated; users sign in again. |
| `PREVIEW_SECRET` | Generate, update Vercel, redeploy. | Existing preview links stop working; new ones work. |
| `CRON_SECRET` | Generate, update Vercel and the scheduler, redeploy. | Scheduled publishes fail until both sides match. |
| `DATABASE_URI` credentials | Rotate in the database provider, update Vercel, redeploy. | Brief downtime during redeploy. |
| `BLOB_READ_WRITE_TOKEN` | Create a new token in Vercel Blob, update the env var, redeploy. | New uploads use the new token; existing files stay readable. |

Rotate any secret that was pasted into a ticket, chat or log. After rotating,
run the smoke test.

## Trash recovery

Posts and answers use Payload trash (`trash: true`).

- Editors can move documents to the trash; only admins can delete permanently.
- Trashed documents are hidden from the public site and from normal lists.
- Restore from `/admin/collections/posts/trash` (or the Answers equivalent):
  open the document and choose **Restore**.
- Permanent deletion is irreversible and also removes versions. Use a database
  restore only if the document cannot be recovered from the trash.

## Monitoring

Watch for 48 hours after cutover and after any schema change:

- **Vercel function logs** — 5xx responses on `/blog`, `/answers`, `/api/*`,
  and `Error: cannot connect to Postgres`.
- **Payload logs** — failed logins, upload errors, revalidation warnings.
- **Database** — connection count, slow queries, storage growth.
- **Blob storage** — upload failures and quota.
- **Search Console** — new 404s, canonical or indexing errors.

A healthy deploy shows no increase in 5xx rate and public pages revalidating
within seconds of a publish.

## Performance check

Run against a production build, not the dev server:

```bash
bun run build
bun run start                    # or use the deployed URL
LOAD_TEST_URL=https://ugle.ai LOAD_ASSERT=1 bun run perf
```

Defaults: 10 workers for 15 seconds, p95 budget 2 s, error rate ≤ 1%.
Tune with `LOAD_CONCURRENCY`, `LOAD_DURATION_MS`, `LOAD_P95_BUDGET_MS` and
`LOAD_MAX_ERROR_RATE`. The check discovers a real post from `/sitemap.xml` and
measures `/blog`, `/blog/<slug>` and `/answers`.

Baseline from a local production build (`next start`, 10 workers, 10 s):

| Path | p50 | p95 | Errors |
|------|-----|-----|--------|
| `/blog` | 112 ms | 171 ms | 0% |
| `/blog/find-quote-in-video-without-exact-words` | 15 ms | 37 ms | 0% |
| `/answers` | 137 ms | 204 ms | 0% |

Re-run the check after significant template, query or hosting changes and
compare against this baseline.

## CI

`.github/workflows/playwright.yml` runs:

1. **Lint & typecheck** — `bun run lint`, `bunx tsc --noEmit`.
2. **Unit tests** — `bun run test` (no database).
3. **E2E** — Postgres 17 service, `bun run migrate`, `bun run seed`,
   `bun run build`, `bun run test:e2e`.
4. **Integration tests** — Postgres 17 service, `bun run test:integration`
   against `ugle_test`.

Staging smoke tests (`.github/workflows/staging-smoke.yml`) run the public
Playwright specs against the preview deployment and document the Payload
staging secrets they expect.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Build fails with `PAYLOAD_SECRET / DATABASE_URI are missing` | `prebuild` env check | Set both variables in the build environment. |
| Build or admin hangs connecting to Postgres | Database unreachable / wrong `DATABASE_URI` | Check the connection string and network access. |
| `relation "..." does not exist` in production | Migrations not run | Run `bun run migrate` before deploying. |
| Media uploads 404 after deploy | Blob token missing or wrong store | Set `BLOB_READ_WRITE_TOKEN` and redeploy. |
| Preview link returns 401/400 | Wrong `PREVIEW_SECRET`, or the path does not belong to the document | Check the secret; use the **Preview** button rather than editing the URL. |
| Admin UI shows stale branding or copy | Payload i18n/import map is memoized | Restart the server; run `bun run generate:importmap` after component changes. |
| A list column is missing | Payload persists columns per user | Reset columns from the list view's column selector. |
| Draft is not on the public site | It is not published | Publish it; drafts are only visible in Preview. |
| Scheduled post did not publish | Cron job not running or `CRON_SECRET` mismatch | Check the scheduler and the bearer token. |
