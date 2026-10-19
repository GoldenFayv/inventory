<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPaymentResource;
use App\Models\SubscriptionPayment;
use App\Services\PaystackService;
use App\Services\SubscriptionPaymentService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerifyTrxController
{
    public function __invoke(Request $request, string $reference, PaystackService $paystackService, SubscriptionService $subscriptionService, SubscriptionPaymentService $paymentService): SubscriptionPaymentResource
    {
        $payment = SubscriptionPayment::whereReference($reference)->firstOrFail();

        if (!$payment->isSuccessful()) {
            $payment = DB::transaction(function () use ($payment, $paystackService, $subscriptionService, $paymentService, $reference) {

                $response = $paystackService->verifyTransaction($reference);

                $payment = $paymentService->completePayment($payment, $response);

                $subscriptionService->activateSubscription($payment);

                return $payment;
            });
        }

        return new SubscriptionPaymentResource($payment->fresh());
    }
}
