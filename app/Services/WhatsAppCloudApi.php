<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppCloudApi
{
    /**
     * Send an approved WhatsApp template message.
     *
     * $to should contain the recipient's country code and number,
     * without a leading "+" or spaces.
     *
     * @throws RequestException
     */
    public function sendTemplate(string $to, string $templateName, string $languageCode = 'en', array $components = [],): array
    {
        $version = config('services.whatsapp.api_version');
        $phoneNumberId = config('services.whatsapp.phone_number_id');
        $accessToken = config('services.whatsapp.access_token');

        if (! $version || ! $phoneNumberId || ! $accessToken) {
            throw new RuntimeException(
                'WhatsApp Cloud API is not configured.'
            );
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $to,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $languageCode,
                ],
                'components' => $components,
            ],
        ];

        $response = Http::whatsapp()->post("/{$version}/{$phoneNumberId}/messages", $payload);

        $response->throw();

        return $response->json();
    }
}
