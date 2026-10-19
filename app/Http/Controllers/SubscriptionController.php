<?php

namespace App\Http\Controllers;

use App\Http\Resources\SubscriptionPaymentResource;
use App\Models\SubscriptionPlanPrice;
use App\Services\PaystackService;
use App\Services\SubscriptionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    public function __construct(public SubscriptionService $subscriptionService, public PaystackService $paystackService) {}

    public function store(Request $request, string $plan_price_id)
    {
        $user = $request->user();

        $price = SubscriptionPlanPrice::query()
            ->with('plan')
            ->where('price', '>', 0)
            ->whereHas('plan', fn(Builder $builder) => $builder->where('is_active', true)->whereForFreeTrial(false)->whereNull('store_id'))
            ->where('is_active', true)
            ->findOrFail($plan_price_id);

        $payment = DB::transaction(fn() => $this->subscriptionService->requestNonTrialPlan($user->active_store, $price));

        $email = $user->active_store->email ?? $user->email;

        if (!$payment->provider_payload) {
            $checkOut = $this->paystackService->initializeTransaction($email, $payment->amount, $payment->currency, $payment->reference);

            $payment->update(["provider_payload" => $checkOut]);

            $payment->refresh();
        }
        return new SubscriptionPaymentResource($payment);
    }
}
