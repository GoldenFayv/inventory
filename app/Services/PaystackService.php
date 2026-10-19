<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class PaystackService
{
    public function initializeTransaction(string $email, int $amount, string $currency, string $reference, array $metadata = []): array
    {
        $secretKey = config('services.paystack.secret_key');
        $baseUrl = rtrim(config('services.paystack.base_url'), '/');

        if (! $secretKey) {
            throw new RuntimeException('Paystack secret key is not configured.');
        }

        if ($amount <= 0) {
            throw new RuntimeException('Payment amount must be greater than zero.');
        }

        if (! preg_match('/^[a-zA-Z0-9\-=.]+$/', $reference)) {
            throw new RuntimeException('Invalid Paystack transaction reference.');
        }

        $response = Http::withToken($secretKey)
            ->acceptJson()
            ->asJson()
            ->connectTimeout(5)
            ->timeout(20)
            ->post("{$baseUrl}/transaction/initialize", [
                'email' => $email,
                'amount' => (string) $amount,
                'currency' => strtoupper($currency),
                'reference' => $reference,
                'callback_url' => config('services.paystack.callback_url'),
                'metadata' => $metadata,
            ]);

        $response->throw();

        $payload = $response->json();

        if (! ($payload['status'] ?? false) || empty($payload['data']['authorization_url']) || empty($payload['data']['reference']) || empty($payload['data']['access_code'])) {
            throw new RuntimeException('Paystack did not return valid checkout data.');
        }

        return [
            'authorization_url' => $payload['data']['authorization_url'],
            'access_code' => $payload['data']['access_code'],
            'reference' => $payload['data']['reference'],
        ];
    }

    public function generateReference(): string
    {
        return 'SUB-' . Str::upper((string) Str::uuid());
    }
}
