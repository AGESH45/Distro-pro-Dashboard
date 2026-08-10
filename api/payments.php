<?php

declare(strict_types=1);

/*
 * This file is loaded by api/index.php for:
 * https://admin.therealmusicdistro.com/api/payments
 *
 * Do not call /api/payments.php from React.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';

function paystack_config(): array
{
    $config = trm_config();

    return $config['paystack'] ?? ['secret_key' => ''];
}

function paystack_request(string $method, string $path, ?array $body = null): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('PHP cURL is not enabled on the server.');
    }

    $secretKey = trim((string) (paystack_config()['secret_key'] ?? ''));

    if ($secretKey === '') {
        throw new RuntimeException('Paystack secret key is not configured on the server.');
    }

    $curl = curl_init('https://api.paystack.co' . $path);

    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $secretKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT => 45,
    ]);

    if ($body !== null) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES));
    }

    $raw = curl_exec($curl);

    if ($raw === false) {
        $error = curl_error($curl);
        curl_close($curl);
        throw new RuntimeException('Could not reach Paystack: ' . $error);
    }

    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    $json = json_decode($raw, true);

    if (!is_array($json)) {
        throw new RuntimeException('Paystack returned an invalid response.');
    }

    if ($status < 200 || $status >= 300 || empty($json['status'])) {
        throw new RuntimeException((string) ($json['message'] ?? 'Paystack request failed.'));
    }

    return $json;
}

function payment_json(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

function payment_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $body = json_decode($raw, true);
    return is_array($body) ? $body : [];
}

function payment_log(string $message): void
{
    error_log('[TRM Payments] ' . $message);
}

/*
 * Sends mail through the one shared admin mailer.
 * A mail failure is logged, but never removes a valid payment request.
 */
function payment_send_mail(array $payload): bool
{
    $apiOrigin = rtrim((string) (trm_config()['app']['api_origin'] ?? ''), '/');

    $mailerUrl = str_ends_with($apiOrigin, '/api')
        ? substr($apiOrigin, 0, -4) . '/mailer.php'
        : 'https://admin.therealmusicdistro.com/mailer.php';

    if (!function_exists('curl_init')) {
        payment_log('Mailer not called: PHP cURL is unavailable.');
        return false;
    }

    $curl = curl_init($mailerUrl);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_SLASHES),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);

    if ($response === false || $status < 200 || $status >= 300) {
        payment_log('Mailer failed. HTTP=' . $status . ' Error=' . $error . ' Response=' . substr((string) $response, 0, 500));
        return false;
    }

    $decoded = json_decode((string) $response, true);
    return is_array($decoded) && !empty($decoded['success']);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, trm_config()['app']['allowed_origins'] ?? [], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') payment_json(['error' => 'Method not allowed'], 405);

$pdo = trm_db();
$user = trm_require_user();
$body = payment_body();
$action = (string) ($body['action'] ?? $_GET['action'] ?? '');

try {
    if ($action === 'banks') {
        $result = paystack_request('GET', '/bank?country=nigeria&perPage=100');
        payment_json($result['data'] ?? []);
    }

    if ($action === 'resolve-account') {
        $accountNumber = preg_replace('/\D/', '', (string) ($body['account_number'] ?? ''));
        $bankCode = trim((string) ($body['bank_code'] ?? ''));
        if (strlen($accountNumber) !== 10 || $bankCode === '') payment_json(['error' => 'A valid account number and bank code are required.'], 422);
        $result = paystack_request('GET', '/bank/resolve?account_number=' . rawurlencode($accountNumber) . '&bank_code=' . rawurlencode($bankCode));
        payment_json([
            'account_number' => $result['data']['account_number'] ?? '',
            'account_name' => $result['data']['account_name'] ?? '',
            'bank_id' => $result['data']['bank_id'] ?? null,
        ]);
    }

    if ($action === 'request-payout') {
        $amount = round((float) ($body['amount'] ?? 0), 2);
        $method = trim((string) ($body['method'] ?? 'bank_transfer'));
        $note = trim((string) ($body['note'] ?? ''));
        if ($amount <= 0) payment_json(['error' => 'Enter a valid payout amount.'], 422);

        $profileStatement = $pdo->prepare('SELECT email, full_name, artist_name FROM profiles WHERE id = ? LIMIT 1');
        $profileStatement->execute([$user['id']]);
        $profile = $profileStatement->fetch(PDO::FETCH_ASSOC) ?: [];
        $artistName = trim((string) ($profile['artist_name'] ?? $profile['full_name'] ?? $user['email'] ?? 'Artist'));
        $requestId = trm_uuid();

        $pdo->beginTransaction();
        $requestStatement = $pdo->prepare('INSERT INTO payout_requests (id, user_id, amount, method, note, status, created_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))');
        $requestStatement->execute([$requestId, $user['id'], $amount, $method, $note, 'pending']);

        $adminNotification = $pdo->prepare('INSERT INTO admin_notifications (title, body, `read`, created_at) VALUES (?, ?, 0, UTC_TIMESTAMP(6))');
        $adminNotification->execute(['New Payout Request', $artistName . ' requested a payout of $' . number_format($amount, 2) . ($note !== '' ? '. Note: ' . $note : '.')]);

        $artistNotification = $pdo->prepare('INSERT INTO artist_notifications (user_id, title, body, `read`, created_at) VALUES (?, ?, ?, 0, UTC_TIMESTAMP(6))');
        $artistNotification->execute([$user['id'], 'Payout Request Submitted', 'Your payout request of $' . number_format($amount, 2) . ' has been submitted and is being processed.']);

        $txStatement = $pdo->prepare('INSERT INTO artist_transactions (id, user_id, amount, method, description, reference, status, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(6))');
        $txId = trm_uuid();
        $txStatement->execute([$txId, $user['id'], $amount, $method, 'Payout Request' . ($note !== '' ? ' — ' . $note : ''), $requestId, 'Processing']);
        $pdo->commit();

        $emailSent = payment_send_mail([
            'event' => 'payout_requested',
            'artist_name' => $artistName,
            'to_email' => (string) ($profile['email'] ?? $user['email'] ?? ''),
            'amount' => number_format($amount, 2, '.', ''),
            'method' => $method,
            'note' => $note,
            'request_id' => $requestId,
        ]);

        payment_json([
            'ok' => true,
            'request_id' => $requestId,
            'status' => 'pending',
            'email_sent' => $emailSent,
            'message' => $emailSent
                ? 'Payment request submitted and the admin team has been notified.'
                : 'Payment request submitted. The admin email could not be sent; check mailer_debug.log.',
        ], 201);
    }

    if ($action === 'payout') {
        if (!trm_is_admin($user)) payment_json(['error' => 'Admin access required for payouts.'], 403);
        $amount = round((float) ($body['amount'] ?? 0), 2);
        $recipient = trim((string) ($body['recipient'] ?? ''));
        $narration = trim((string) ($body['narration'] ?? 'TRM Distro royalty payout'));
        if ($amount <= 0 || $recipient === '') payment_json(['error' => 'A valid amount and Paystack recipient code are required.'], 422);
        $result = paystack_request('POST', '/transfer', [
            'source' => 'balance',
            'amount' => (int) round($amount * 100),
            'recipient' => $recipient,
            'reason' => $narration,
        ]);
        payment_json([
            'ok' => true,
            'reference' => $result['data']['reference'] ?? '',
            'status' => $result['data']['status'] ?? 'pending',
            'message' => $result['message'] ?? 'Transfer initiated.',
        ]);
    }

    if ($action === 'verify') {
        $reference = trim((string) ($body['reference'] ?? $_GET['reference'] ?? ''));
        if ($reference === '') payment_json(['error' => 'Transfer reference is required.'], 422);
        $result = paystack_request('GET', '/transfer/verify/' . rawurlencode($reference));
        payment_json([
            'ok' => !empty($result['status']),
            'reference' => $result['data']['reference'] ?? '',
            'status' => $result['data']['status'] ?? 'unknown',
            'message' => $result['message'] ?? '',
        ]);
    }

    payment_json(['error' => 'Unknown payment action.'], 400);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    payment_log($error->getMessage());
    payment_json(['error' => 'Payment request could not be processed. Check the server error log.'], 500);
}
