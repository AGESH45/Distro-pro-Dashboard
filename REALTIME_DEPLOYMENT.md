# TRM Distro real-time deployment

## cPanel

Create a Node.js application pointing at `realtime/server.mjs` and keep it running as a persistent process.

Environment variables:

- `REALTIME_TOKEN_SECRET` — long random secret used by PHP to mint short-lived browser tokens.
- `REALTIME_PUBLISH_SECRET` — separate long random secret used by PHP to publish events.
- `PORT` — use the port assigned by cPanel.

Point `realtime.therealmusicdistro.com` (or another WebSocket-capable hostname) at the Node application and use `wss://` in `VITE_REALTIME_URL`.

## PHP API integration

Load `api/realtime.php` alongside the existing authenticated PHP API. For an authenticated user, return:

```php
['token' => trm_realtime_token($user, $config['realtime']['token_secret'])]
```

After successful MariaDB mutations, publish the corresponding event:

```php
trm_realtime_publish(
    $config['realtime']['url'],
    $config['realtime']['publish_secret'],
    'artist:'.$user['id'],
    'payout.created',
    ['request_id' => $requestId]
);
```

For admin events publish to the `admin` topic. Never expose either secret to the browser.

## Event-driven payout flow

1. Artist submits payout request.
2. PHP validates the server-side available royalty balance.
3. MariaDB transaction creates the payout request and transaction record.
4. PHP sends the email notification.
5. PHP publishes `payout.created` to the artist and admin topics.
6. Admin dashboard receives the WebSocket event immediately.
7. Admin approval/rejection updates MariaDB, sends the artist email, and publishes `payout.approved` or `payout.rejected`.
8. Artist dashboard receives the event immediately.

There is deliberately no polling timer in this realtime design.
