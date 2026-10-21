<?php

namespace App\Notifications\Channels;

use App\Notifications\StoreAlertNotification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class WhatsAppCloudChannel
{
    public function send(object $notifiable, StoreAlertNotification $notification,): void
    {
        $phone = $this->normalizePhone($notifiable->phone ?? null);

        if (! $phone) {
            Log::warning('WhatsApp notification skipped: recipient has no valid phone number.', [
                'notification' => $notification::class,
                'recipient_id' => $notifiable->getKey(),
            ]);

            return;
        }

        $version = config('services.whatsapp.api_version');
        $phoneNumberId = config('services.whatsapp.phone_number_id');
        $accessToken = config('services.whatsapp.access_token');
        $templateName = config('services.whatsapp.alert_template');
        $language = config('services.whatsapp.template_language', 'en');

        if (! $version || ! $phoneNumberId || ! $accessToken || ! $templateName) {
            throw new RuntimeException('WhatsApp Cloud API is not configured.');
        }

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->asJson()
            ->timeout(15)
            ->post(
                "https://graph.facebook.com/{$version}/{$phoneNumberId}/messages",
                [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $phone,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => [
                            'code' => $language,
                        ],
                        'components' => [
                            [
                                'type' => 'body',
                                'parameters' => [
                                    [
                                        'type' => 'text',
                                        'text' => $notification->title,
                                    ],
                                    [
                                        'type' => 'text',
                                        'text' => $notification->message,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            );

        $response->throw();
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
            $phone = '234' . substr($phone, 1);
        }

        return preg_match('/^[1-9]\d{7,14}$/', $phone)
            ? $phone
            : null;
    }
}
