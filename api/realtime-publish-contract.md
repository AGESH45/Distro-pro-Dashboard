# Realtime PHP publish contract

The PHP/MariaDB API must POST JSON to the realtime server `/publish` endpoint with the header `X-Realtime-Secret`.

Payload:

```json
{
  "topic": "admin",
  "type": "payout.created",
  "data": {
    "request_id": "...",
    "user_id": "..."
  }
}
```

The realtime token endpoint should return a short-lived HMAC token for the authenticated session. The browser uses that token to establish the WebSocket connection.
