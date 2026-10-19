<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPayment;
use App\Services\PaystackService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    public function __invoke(Request $request, PaystackService $paystack, SubscriptionService $subscriptionService): JsonResponse
    {
        $rawPayload = $request->getContent();

        if (! $paystack->isValidWebhookSignature($rawPayload, $request->header('x-paystack-signature'))) {
            return response()->json(['message' => 'Invalid webhook signature.',], 401);
        }

        $event = $request->json()->all();

        if (($event['event'] ?? null) !== 'charge.success') {
            return response()->json(['received' => true]);
        }

        $reference = $event['data']['reference'] ?? null;

        if (! is_string($reference) || $reference === '') {
            return response()->json(['received' => true]);
        }

        $payment = SubscriptionPayment::query()
            ->where('provider', 'paystack')
            ->where('reference', $reference)
            ->first();

        if (! $payment) {
            Log::warning('Paystack webhook has no matching payment.', [
                'reference' => $reference,
            ]);

            return response()->json(['received' => true]);
        }

        $verified = $paystack->verifyTransaction($reference);

        $expectedAmount = $payment->amount;

        $matches = ($verified['status'] ?? null) === 'success' && ($verified['reference'] ?? null) === $payment->reference && $expectedAmount !== null && isset($verified['amount']) && (int) $verified['amount'] === $expectedAmount && strtoupper($verified['currency'] ?? '') === strtoupper($payment->currency);

        if (! $matches) {
            Log::warning('Paystack transaction verification did not match payment.', [
                'payment_id' => $payment->id,
                'reference' => $reference,
            ]);

            return response()->json(['received' => true]);
        }

        // $subscriptionService->activateSubscription($payment, $verified);

        return response()->json(['received' => true]);
    }
}
