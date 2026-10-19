<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaystackService
{
    public function __construct(private ?string $secretKey = null, private ?string $baseUrl = null)
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->baseUrl = rtrim(config('services.paystack.base_url'), '/');

        if (! $this->secretKey) {
            throw new RuntimeException('Paystack secret key is not configured.');
        }
    }
    public function initializeTransaction(string $email, int $amount, string $currency, string $reference, array $metadata = []): array
    {
        if ($amount <= 0) {
            throw new RuntimeException('Payment amount must be greater than zero.');
        }

        if (! preg_match('/^[a-zA-Z0-9\-=.]+$/', $reference)) {
            throw new RuntimeException('Invalid Paystack transaction reference.');
        }

        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->asJson()
            ->connectTimeout(5)
            ->timeout(20)
            ->post("{$this->baseUrl}/transaction/initialize", [
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

    public function verifyTransaction(string $reference): array
    {
        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(20)
            ->get("{$this->baseUrl}/transaction/verify/" . rawurlencode($reference));

        $response->throw();

        $payload = $response->json();

        if (! ($payload['status'] ?? false) || ! isset($payload['data'])) {
            throw new RuntimeException('Paystack transaction verification failed.');
        }

        return $payload['data'];
    }

    public function isValidWebhookSignature(string $payload, ?string $signature): bool
    {
        if (! $this->secretKey || ! $signature) {
            return false;
        }

        $expected = hash_hmac('sha512', $payload, $this->secretKey);

        return hash_equals($expected, $signature);
    }
}
