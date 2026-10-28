# Rate limiter + duplicate claims (Cloudflare Worker + Durable Object)

Standalone rate-limit and claim service for the **request-trial** form. It is
not a proxy and does not touch DNS — the Next.js server action calls it with the
visitor's IP or normalized email and gets a decision.

```
Browser → Vercel server action ──POST /check────→ Cloudflare Worker
                                ├─POST /claim───→        │
                                └─POST /release─→        ▼
                                           Durable Object (SQLite)
```

The same Durable Object also stores one hash per email that has requested a
trial. `/claim` is a single atomic SQL statement, so two concurrent submissions
for the same inbox cannot both succeed — something a "read the sheet, then
append" check can never guarantee. `/release` removes a claim when neither
Resend nor Sheets captured the lead, so a transient outage does not permanently
block that email.

## Why a Worker and not WAF rate limiting?

Cloudflare's WAF rate limiting only sees proxied traffic, and `ugle.ai` uses
Porkbun nameservers pointed at Vercel. The Free plan also limits WAF rules to a
10-second window and 10-second mitigation — not useful for "5 trials per hour".
Workers + Durable Objects are free at this volume and need no DNS change.

## Free-plan limits (plenty)

| Resource | Free |
|---|---|
| Worker requests | 100,000 / day |
| Durable Object requests | 100,000 / day |
| DO rows written | 100,000 / day |
| DO storage | 5 GB |

## Limits

Configured in `wrangler.jsonc` under `vars`:

- `HOURLY_LIMIT` — default `5`
- `DAILY_LIMIT` — default `15`
- `CLAIM_TTL_DAYS` — default `180`
- `PROVISIONAL_CLAIM_MINUTES` — default `10`

IP counters are keyed by UTC hour/day (fixed window) and are deleted after 2
days. Email claims expire after `CLAIM_TTL_DAYS` so a genuine customer can
re-apply eventually. The per-email limiter sends its own limits (3/hour,
6/day) in the request body.

## Claim lifecycle

The trial form reserves an inbox **provisionally** (`/claim` with
`provisional: true`) while it sends the emails and appends the sheet row:

```
/claim (provisional, 10 min) ──success──▶ /confirm (180 days)
        │
        └──both integrations failed──▶ /release (deleted immediately)

        (no callback at all) ──▶ lapses on its own after 10 minutes
```

This means a request that dies mid-flight (timeout, crash, cold-start eviction)
only blocks that inbox for at most `PROVISIONAL_CLAIM_MINUTES`, while a captured
lead is protected for `CLAIM_TTL_DAYS`.

`/release` only deletes claims that are **still inside the provisional window**,
so a late or duplicate release from a failed request cannot erase a claim that
was already confirmed. Pass `"force": true` for manual/operator recovery
(e.g. unblocking your own address while testing).

## Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/health` | – | `{ ok: true }` |
| `POST` | `/check` | `{ key, namespace?, hourlyLimit?, dailyLimit? }` | `{ allowed, retryAfter }` |
| `POST` | `/claim` | `{ key, namespace: "email", provisional? }` | `{ claimed }` |
| `POST` | `/confirm` | `{ key, namespace: "email" }` | `{ confirmed }` |
| `POST` | `/release` | `{ key, namespace: "email", force? }` | `{ released }` |
| `POST` | `/backfill` | `{ emails: string[] }` (max 500) | `{ inserted, invalid }` |

`namespace` defaults to `"ip"`; email keys must contain a single `@`.
`/backfill` seeds claims for addresses that already requested a trial; it exists
in the Worker but no script drives it yet.

## Deploy

```bash
cd workers/rate-limit

# one-time: log in to the Cloudflare account that owns Turnstile
bunx wrangler login

# shared secret the Next.js action must present
bunx wrangler secret put RATE_LIMIT_SECRET

# deploy (creates the Worker + SQLite-backed Durable Object)
bunx wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://ugle-rate-limit.<your-subdomain>.workers.dev`.

Then add both variables to Vercel (Production and Preview):

| Variable | Value |
|---|---|
| `RATE_LIMIT_WORKER_URL` | the printed `https://…workers.dev` URL |
| `RATE_LIMIT_WORKER_SECRET` | the same secret you entered above |

Redeploy the Next app so the action picks them up. Until both are set, the
action falls back to its in-memory limiter and the Sheets duplicate scan.
**Deploy the Worker before the app**: if the app calls `/claim` against an old
Worker, it receives a 404 and safely falls back.

## Local smoke test

```bash
curl https://ugle-rate-limit.<subdomain>.workers.dev/health
# {"ok":true}

curl -X POST https://ugle-rate-limit.<subdomain>.workers.dev/check \
  -H "authorization: Bearer $RATE_LIMIT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"203.0.113.9"}'
# {"allowed":true,"retryAfter":0}   (then false once the limit is passed)

curl -X POST https://ugle-rate-limit.<subdomain>.workers.dev/claim \
  -H "authorization: Bearer $RATE_LIMIT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"someone@example.com","namespace":"email","provisional":true}'
# {"claimed":true}   (then false for the same normalized email)

curl -X POST https://ugle-rate-limit.<subdomain>.workers.dev/confirm \
  -H "authorization: Bearer $RATE_LIMIT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"someone@example.com","namespace":"email"}'
# {"confirmed":true}   (false if the provisional claim already lapsed)

# manual recovery: unblock an address while testing (skips the TTL guard)
curl -X POST https://ugle-rate-limit.<subdomain>.workers.dev/release \
  -H "authorization: Bearer $RATE_LIMIT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"someone@example.com","namespace":"email","force":true}'
# {"released":true,"forced":true}
```

## Behaviour notes

- **Fails open**: network error, timeout (2s), non-2xx, or missing env vars all
  let the submission through. A limiter outage must not block real trials.
- **Atomic duplicate claims**: `/claim` is one SQL statement in a single Durable
  Object, so concurrent submissions for the same normalized email can't both
  win. This replaces the O(n) full-column Sheets read in the normal path.
- **Provisional first**: the app claims for `PROVISIONAL_CLAIM_MINUTES` and only
  promotes to `CLAIM_TTL_DAYS` after a lead is captured. A crash between the two
  cannot block the inbox for months.
- **Failed submissions release their claim**: if Resend *and* Sheets both fail,
  the app calls `/release` so the user can retry immediately. Releases are
  ignored for claims that were already confirmed.
- **Shared NAT**: offices and mobile carriers share IPs, so limits are
  deliberately generous. Tighten `vars` if abuse persists.
- **IPv6 privacy addresses** rotate per network/session, so a determined user
  can partially evade IP limits. The per-email limit, atomic claim, and
  disposable-domain blocklist still apply.
- **Privacy**: raw IPs and emails are never stored. The Worker hashes them with
  the shared secret (namespace-scoped) before writing, and counters are deleted
  after ~2 days.
