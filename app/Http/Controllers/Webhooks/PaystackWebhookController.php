<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Services\PaystackService;
use App\Services\SubscriptionPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    public function __invoke(Request $request, PaystackService $paystack, SubscriptionPaymentService $paymentService): JsonResponse
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

        if (!$payment->isSuccessful()) {
            $paymentService->verify($payment, $request->user(), $reference);
        }

        return response()->json(['received' => true]);
    }
}
