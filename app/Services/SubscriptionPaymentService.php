<?php

namespace App\Services;

use App\Enum\SubscriptionPaymentStatus;
use App\Models\SubscriptionPayment;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SubscriptionPaymentService
{
    public function completePayment(SubscriptionPayment $payment, array $verifiedTransaction): SubscriptionPayment
    {
        $payment = SubscriptionPayment::query()
            ->whereKey($payment->getKey())
            ->lockForUpdate()
            ->firstOrFail();

        if ($payment->isSuccessful()) {
            return $payment;
        }
        $reference = $verifiedTransaction['reference'] ?? null;
        $amount = $verifiedTransaction['amount'] ?? null;
        $matches = (int) $amount === $payment->amount && $reference === $payment->reference && ($verifiedTransaction['status'] ?? null) === 'success' && ($verifiedTransaction['currency'] ?? null) === $payment->currency;

        if (!$matches) {
            Log::warning('Subscription payment verification mismatch', [
                'payment_id' => $payment->getKey(),
                'status' => $verifiedTransaction['status'] ?? null,
            ]);

            throw ValidationException::withMessages([
                'payment' => 'The payment could not be verified.',
            ]);
        }

        $payment->update([
            'status' => SubscriptionPaymentStatus::SUCCESSFUL,
            'paid_at' => isset($verifiedTransaction['paid_at'])
                ? CarbonImmutable::parse($verifiedTransaction['paid_at'])
                : CarbonImmutable::now(),
            'provider_payload' => $verifiedTransaction,
        ]);

        return $payment->fresh();
    }
}
