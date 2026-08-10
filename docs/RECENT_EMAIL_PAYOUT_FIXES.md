# Recent MariaDB Email + Payout Fixes

This branch is for the MariaDB/PHP version of TRM Distro. It must not reintroduce Supabase.

## Payout request flow

The artist submits a payout request to the PHP endpoint:

`POST /api/payments.php?action=request-payout`

The server:

1. Authenticates the current user.
2. Reads the artist profile from MariaDB.
3. Creates a `payout_requests` row with status `pending`.
4. Creates an admin notification.
5. Creates an artist confirmation notification.
6. Creates an `artist_transactions` row with status `Processing` and the payout request UUID as its reference.
7. Commits the MariaDB transaction before attempting email delivery.
8. Calls the shared `public/mailer.php` endpoint with the `payout_requested` event.
9. Returns `email_sent` separately so a mail outage does not undo a valid payout request.

## Email behavior

Email delivery is server-side. The browser does not contain SMTP credentials and does not directly send payout mail.

The mailer supports the `payout_requested` event and the payout approval/rejection events used by the admin workflow. Mail failures are written to `mailer_debug.log` and do not roll back the payout database transaction.

## Realtime behavior

After the MariaDB transaction succeeds, the API should publish the payout event to the Node WebSocket service. Admin clients subscribe to `admin`; artists subscribe to `artist:{user_id}`. No polling or fake `channel()` compatibility layer should be used.

## Deployment

Upload the MariaDB/PHP `api/` and `public/` files from the authoritative MariaDB project (`work.zip`) together with the realtime server. Configure the realtime server with `REALTIME_TOKEN_SECRET` and `REALTIME_PUBLISH_SECRET`, and configure the PHP API with matching values.

Do not deploy any old Supabase files or Supabase-generated bundles from the repository's previous application.
