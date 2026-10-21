<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\NotificationDelivery;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->isMethod('get')) {
            return $this->verifyWebhook($request);
        }

        if (! $this->hasValidSignature($request)) {
            abort(401, 'Invalid webhook signature.');
        }

        $payload = $request->json()->all();

        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $statuses = $change['value']['statuses'] ?? [];

                foreach ($statuses as $status) {
                    $this->updateDelivery($status);
                }
            }
        }

        return response('EVENT_RECEIVED', 200);
    }

    private function verifyWebhook(Request $request): Response
    {
        $mode = $request->query('hub.mode');
        $token = $request->query('hub.verify_token');
        $challenge = $request->query('hub.challenge');
        $expectedToken = config('services.whatsapp.verify_token');

        if ($mode === 'subscribe' && is_string($expectedToken) && $expectedToken !== '' && is_string($token) && hash_equals($expectedToken, $token) && is_string($challenge)) {
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        abort(403, 'Webhook verification failed.');
    }

    private function hasValidSignature(Request $request): bool
    {
        $appSecret = config('services.whatsapp.app_secret');
        $signature = $request->header('X-Hub-Signature-256');

        if (! is_string($appSecret) || $appSecret === '' || ! is_string($signature) || ! str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $expected = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);

        return hash_equals($expected, $signature);
    }

    private function updateDelivery(array $status): void
    {
        $messageId = $status['id'] ?? null;
        $providerStatus = $status['status'] ?? null;

        if (! is_string($messageId) || ! is_string($providerStatus)) {
            return;
        }

        $delivery = NotificationDelivery::query()->where('provider_message_id', $messageId)->where('channel', 'whatsapp')->first();

        if (! $delivery) {
            // Webhooks may arrive before the message ID has been saved.
            // Acknowledge the event rather than causing repeated retries.
            Log::warning('WhatsApp webhook references an unknown message ID.');

            return;
        }

        $timestamp = isset($status['timestamp'])
            ? Carbon::createFromTimestamp((int) $status['timestamp'])
            : now();

        $updates = match ($providerStatus) {
            'sent' => [
                'status' => 'accepted',
            ],
            'delivered' => [
                'status' => 'delivered',
                'delivered_at' => $timestamp,
            ],
            'read' => [
                'status' => 'read',
                'delivered_at' => $delivery->delivered_at ?? $timestamp,
                'read_at' => $timestamp,
            ],
            'failed' => [
                'status' => 'failed',
                'error_message' => $this->failureMessage($status),
            ],
            default => null,
        };

        if ($updates === null) {
            return;
        }

        // Avoid downgrading a status if Meta sends events out of order.
        $rank = [
            'queued' => 0,
            'accepted' => 1,
            'delivered' => 2,
            'read' => 3,
            'failed' => 4,
        ];

        $currentRank = $rank[$delivery->status] ?? -1;
        $newRank = $rank[$updates['status']] ?? -1;

        if (
            $providerStatus !== 'failed'
            && $newRank < $currentRank
        ) {
            return;
        }

        $delivery->update($updates);
    }

    private function failureMessage(array $status): string
    {
        $error = $status['errors'][0] ?? [];

        $message = $error['title']
            ?? $error['message']
            ?? $error['code']
            ?? 'WhatsApp delivery failed.';

        return mb_substr((string) $message, 0, 1000);
    }
}
