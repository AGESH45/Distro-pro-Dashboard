<?php
declare(strict_types=1);

/*
 * MariaDB payout-email bridge.
 * This endpoint is intentionally server-side: SMTP credentials never reach React.
 * If the full production mailer.php from the MariaDB deployment is already present
 * on cPanel, keep using that file; this is a minimal compatible payout handler.
 */
header('Content-Type: application/json; charset=utf-8');

function mail_json(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mail_json(['error' => 'Method not allowed'], 405);

$body = json_decode(file_get_contents('php://input') ?: '{}', true);
if (!is_array($body)) mail_json(['error' => 'Invalid JSON'], 400);

$event = (string)($body['event'] ?? '');
$artist = trim((string)($body['artist_name'] ?? 'Artist'));
$artistEmail = trim((string)($body['to_email'] ?? ''));
$amount = trim((string)($body['amount'] ?? '0.00'));
$note = trim((string)($body['note'] ?? ''));
$requestId = trim((string)($body['request_id'] ?? ''));
$adminEmail = trim((string)(getenv('TRM_ADMIN_EMAIL') ?: getenv('ADMIN_EMAIL') ?: ''));
$fromEmail = trim((string)(getenv('TRM_FROM_EMAIL') ?: getenv('FROM_EMAIL') ?: ''));

if ($event !== 'payout_requested') mail_json(['error' => 'Unsupported email event'], 422);
if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) mail_json(['error' => 'Admin email is not configured'], 500);

$subject = 'New Payout Request: $' . $amount . ' from ' . $artist;
$html = '<h2>New Payout Request</h2>'
    . '<p><strong>' . htmlspecialchars($artist) . '</strong> has submitted a payout request.</p>'
    . '<p>Amount: <strong>$' . htmlspecialchars($amount) . '</strong></p>'
    . '<p>Artist email: ' . htmlspecialchars($artistEmail) . '</p>'
    . ($note !== '' ? '<p>Note: ' . nl2br(htmlspecialchars($note)) . '</p>' : '')
    . ($requestId !== '' ? '<p>Request ID: <code>' . htmlspecialchars($requestId) . '</code></p>' : '');

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=UTF-8';
if ($fromEmail !== '' && filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) $headers[] = 'From: TRM Distro <' . $fromEmail . '>';

$adminSent = @mail($adminEmail, $subject, $html, implode("\r\n", $headers));
$artistSent = false;
if ($artistEmail !== '' && filter_var($artistEmail, FILTER_VALIDATE_EMAIL)) {
    $artistSent = @mail($artistEmail, 'Payout Request Received - TRM Distro', '<p>Hi ' . htmlspecialchars($artist) . ',</p><p>We received your payout request for <strong>$' . htmlspecialchars($amount) . '</strong>. Our finance team will review it shortly.</p>', implode("\r\n", $headers));
}

if (!$adminSent) mail_json(['success' => false, 'error' => 'Admin email could not be queued.'], 502);
mail_json(['success' => true, 'admin_sent' => true, 'artist_sent' => $artistSent]);
