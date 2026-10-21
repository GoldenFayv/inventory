<?php

namespace App\Notifications\Channels;

use App\Notifications\StoreAlertNotification;
use App\Services\NotificationDeliveryService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TermiiSmsChannel
{
    public function __construct(public NotificationDeliveryService $deliveryService)
    {
        
    }
    public function send(object $notifiable, StoreAlertNotification $notification): void
    {
        $phone = $this->normalizePhone($notifiable->phone ?? null);

        if (! $phone) {
            Log::warning('SMS notification skipped: recipient has no valid phone number.', [
                'notification' => $notification::class,
                'recipient_id' => $notifiable->getKey(),
            ]);

            return;
        }


        $apiKey = config('services.termii.api_key');
        $senderId = config('services.termii.sender_id');

        if (! $apiKey || ! $senderId) {
            throw new RuntimeException('Termii is not configured.');
        }

        $response = Http::termii([
            'api_key' => $apiKey,
            'to' => $phone,
            'from' => $senderId,
            'sms' => "{$notification->title}: {$notification->message}",
            'type' => 'plain',
            'channel' => config('services.termii.channel', 'generic'),
        ]);

        $response->throw();
        $this->deliveryService->accepted(
            $notification->deliveryId,
            $response->json('message_id'),
        );
    }

    private function normalizePhone(?string $phone): ?string
    {
        if (! $phone) {
            return null;
        }

        $phone = preg_replace('/[\s()\-]/', '', trim($phone));

        if (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        } elseif (str_starts_with($phone, '00')) {
            $phone = substr($phone, 2);
        } elseif (str_starts_with($phone, '0') && strlen($phone) === 11) {
            // Nigerian local number, e.g. 08012345678.
            $phone = '234' . substr($phone, 1);
        }

        return preg_match('/^[1-9]\d{7,14}$/', $phone)
            ? $phone
            : null;
    }
}
