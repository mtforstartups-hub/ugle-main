# IP rate limiter (Cloudflare Worker + Durable Object)

Standalone rate-limit service for the **request-trial** form. It is not a proxy
and does not touch DNS — the Next.js server action calls it with the visitor's
IP and gets an allow/deny decision.

```
Browser → Vercel server action ──POST /check──▶ Cloudflare Worker
                                                    │
                                                    ▼
                                        Durable Object (SQLite counters)
```

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

Both are **per IP**. Counters are keyed by UTC hour/day (fixed window) and are
deleted after 2 days.

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
action skips IP limiting and fails open.

## Local smoke test

```bash
curl https://ugle-rate-limit.<subdomain>.workers.dev/health
# {"ok":true}

curl -X POST https://ugle-rate-limit.<subdomain>.workers.dev/check \
  -H "authorization: Bearer $RATE_LIMIT_WORKER_SECRET" \
  -H "content-type: application/json" \
  -d '{"key":"203.0.113.9"}'
# {"allowed":true,"retryAfter":0}   (then false once the limit is passed)
```

## Behaviour notes

- **Fails open**: network error, timeout (2s), non-2xx, or missing env vars all
  let the submission through. A limiter outage must not block real trials.
- **Shared NAT**: offices and mobile carriers share IPs, so limits are
  deliberately generous. Tighten `vars` if abuse persists.
- **IPv6 privacy addresses** rotate per network/session, so a determined user
  can partially evade IP limits. The per-email limit and the disposable-domain
  blocklist still apply.
- **Privacy**: raw IPs are never stored. The Worker hashes the IP with the
  shared secret before writing it, and counters are deleted after ~2 days.
