# TRM Distro Realtime

This branch adds a genuine WebSocket realtime transport. It is intentionally independent of Supabase.

## Runtime

Run `node realtime/server.mjs` as a persistent cPanel Node.js application. Configure `REALTIME_TOKEN_SECRET` and `REALTIME_PUBLISH_SECRET`.

The browser client is `src/lib/realtime.ts`. The PHP API should mint short-lived HMAC realtime tokens and publish database/payment events to the realtime server's `/publish` endpoint using `X-Realtime-Secret`.

## Channels

- `admin` — admin dashboard events
- `artist:{userId}` — events for one artist

## Event examples

- `db.artist_releases.created`
- `db.artist_transactions.updated`
- `db.artist_notifications.created`
- `payout.created`
- `payout.approved`
- `payout.rejected`

No polling loop is required for realtime delivery.
