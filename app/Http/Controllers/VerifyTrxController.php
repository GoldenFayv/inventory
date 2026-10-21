<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPaymentResource;
use App\Models\SubscriptionPayment;
use App\Services\SubscriptionPaymentService;
use Illuminate\Http\Request;

class VerifyTrxController
{
    public function __invoke(Request $request, string $reference,  SubscriptionPaymentService $paymentService): SubscriptionPaymentResource
    {
        $payment = SubscriptionPayment::whereReference($reference)->firstOrFail();

        if (!$payment->isSuccessful()) {
            $payment = $paymentService->verify($payment, $request->user(), $reference);
        }

        return new SubscriptionPaymentResource($payment->fresh());
    }
}
