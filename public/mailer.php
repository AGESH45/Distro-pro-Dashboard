<?php
declare(strict_types=1);

/* MariaDB/PHP mailer endpoint. SMTP credentials remain server-side. */
header('Content-Type: application/json; charset=utf-8');

function mailer_json(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') mailer_json(['error' => 'Method not allowed'], 405);
$body = json_decode(file_get_contents('php://input') ?: '{}', true);
if (!is_array($body)) mailer_json(['error' => 'Invalid JSON'], 400);

$event = (string)($body['event'] ?? '');
$artist = trim((string)($body['artist_name'] ?? 'Artist'));
$artistEmail = trim((string)($body['to_email'] ?? ''));
$amount = trim((string)($body['amount'] ?? '0.00'));
$method = trim((string)($body['method'] ?? 'bank_transfer'));
$note = trim((string)($body['note'] ?? ''));
$requestId = trim((string)($body['request_id'] ?? ''));
$adminEmail = trim((string)(getenv('TRM_ADMIN_EMAIL') ?: getenv('ADMIN_EMAIL') ?: ''));
$fromEmail = trim((string)(getenv('TRM_FROM_EMAIL') ?: getenv('FROM_EMAIL') ?: ''));

if ($event !== 'payout_requested') mailer_json(['error' => 'Unsupported email event'], 422);
if ($adminEmail === '' || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) mailer_json(['error' => 'Admin email is not configured'], 500);

$subject = 'New Payout Request: $' . $amount . ' from ' . $artist;
$html = '<h2>New Payout Request</h2>'
    . '<p><strong>' . htmlspecialchars($artist) . '</strong> has submitted a payout request.</p>'
    . '<table><tr><td>Amount</td><td><strong>$' . htmlspecialchars($amount) . '</strong></td></tr>'
    . '<tr><td>Method</td><td>' . htmlspecialchars($method) . '</td></tr>'
    . '<tr><td>Artist email</td><td>' . htmlspecialchars($artistEmail) . '</td></tr></table>'
    . ($note !== '' ? '<p>Note: ' . nl2br(htmlspecialchars($note)) . '</p>' : '')
    . ($requestId !== '' ? '<p>Request ID: <code>' . htmlspecialchars($requestId) . '</code></p>' : '');

$headers = ['MIME-Version: 1.0', 'Content-Type: text/html; charset=UTF-8'];
if ($fromEmail !== '' && filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) $headers[] = 'From: TRM Distro <' . $fromEmail . '>';
$headerText = implode("\r\n", $headers);

$adminSent = @mail($adminEmail, $subject, $html, $headerText);
$artistSent = false;
if ($artistEmail !== '' && filter_var($artistEmail, FILTER_VALIDATE_EMAIL)) {
    $artistHtml = '<p>Hi ' . htmlspecialchars($artist) . ',</p><p>We received your payout request for <strong>$' . htmlspecialchars($amount) . '</strong>.</p><p>Our finance team will review and process it shortly.</p>';
    $artistSent = @mail($artistEmail, 'Payout Request Received - TRM Distro', $artistHtml, $headerText);
}

if (!$adminSent) mailer_json(['success' => false, 'error' => 'Admin email could not be queued.'], 502);
mailer_json(['success' => true, 'admin_sent' => true, 'artist_sent' => $artistSent]);
