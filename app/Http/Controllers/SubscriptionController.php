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
            ->whereHas('plan', function (Builder $builder) {
                $builder->where('is_active', true)->where('price', '>', 0)->whereNull('store_id');
            })
            ->where('is_active', true)
            ->findOrFail($plan_price_id);

        return DB::transaction(function () use ($user, $price): SubscriptionPaymentResource {

            $payment = $this->subscriptionService->requestNonTrialPlan($user->active_store, $price)->fresh();

            $email = $user->active_store->email ?? $user->email;

            $checkOut = $this->paystackService->initializeTransaction($email, $payment->amount, $payment->currency, $payment->reference);

            return new SubscriptionPaymentResource($payment)->additional(["checkout" => $checkOut]);
        });
    }
}
