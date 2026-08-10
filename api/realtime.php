<?php
declare(strict_types=1);

// Standalone PHP bridge for the MariaDB/cPanel realtime server.
// Include this file from the authenticated API after loading your existing
// database/session helpers. It exposes the same token/publish contract used
// by src/lib/realtime.ts.

function trm_realtime_token(array $user, string $secret, int $ttl = 300): string {
    $payload = ['id'=>(string)$user['id'], 'role'=>(string)($user['role'] ?? 'artist'), 'iat'=>time(), 'exp'=>time()+$ttl];
    $encoded = rtrim(strtr(base64_encode(json_encode($payload, JSON_UNESCAPED_SLASHES)), '+/', '-_'), '=');
    $sig = rtrim(strtr(base64_encode(hash_hmac('sha256', $encoded, $secret, true)), '+/', '-_'), '=');
    return $encoded.'.'.$sig;
}

function trm_realtime_publish(string $url, string $secret, string $topic, string $type, array $data = []): bool {
    if ($url === '' || $secret === '' || !function_exists('curl_init')) return false;
    $ch = curl_init(rtrim($url, '/').'/publish');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_TIMEOUT => 4,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Realtime-Secret: '.$secret],
        CURLOPT_POSTFIELDS => json_encode(['topic'=>$topic,'type'=>$type,'data'=>$data], JSON_UNESCAPED_SLASHES),
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $response !== false && $status >= 200 && $status < 300;
}
