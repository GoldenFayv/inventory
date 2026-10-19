<?php

namespace App\Services;

use App\Actions\Subscriptions\CreateSubscription;
use App\Actions\Subscriptions\CreateSubscriptionPayment;
use App\Enum\BillingInterval;
use App\Enum\SubscriptionPaymentEnum;
use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanPrice;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function __construct(public CreateSubscription $createSubscription, public CreateSubscriptionPayment $createPayment) {}

    public function startTrialPlan(Store $store): Subscription
    {
        return DB::transaction(function () use ($store) {
            $existingSubscription = Subscription::query()->where('store_id', $store->getKey())->exists();

            if ($existingSubscription) {
                throw ValidationException::withMessages([
                    'subscription' => 'This store already has a subscription history.',
                ]);
            }

            $trialPlan = SubscriptionPlan::query()->whereNull('store_id')->whereForFreeTrial(true)->where('is_active', true)->first();

            if (! $trialPlan || !$trialPlan->prices) {
                throw ValidationException::withMessages([
                    'subscription' => 'The free trial plan is not configured.',
                ]);
            }

            $planPrice = $trialPlan->prices()->where('billing_interval', BillingInterval::BI_WEEKLY)->first();

            if (! $planPrice || !$trialPlan->is_active) {
                throw ValidationException::withMessages([
                    'subscription' => 'The free trial plan is not available now.',
                ]);
            }

            $startsAt = now();

            $subscription = $this->createSubscription->handle($store, $planPrice, $startsAt,  $startsAt->copy()->addDays(14), SubscriptionStatus::TRIALING);

            return $this->createPayment->handle($subscription);
        });
    }

    public function requestNonTrialPlan(Store $store, SubscriptionPlanPrice $subscriptionPlanPrice): SubscriptionPayment
    {
        $hasPendingSubscription = Subscription::query()
            ->where('store_id', $store->getKey())
            ->where('status', SubscriptionPaymentEnum::PENDING)
            ->whereNull('ends_at')
            ->where('subscription_plan_price_id', $subscriptionPlanPrice->getKey())
            ->latest()->first();

        $subscription = ($hasPendingSubscription) ? $hasPendingSubscription : $this->createSubscription->handle($store, $subscriptionPlanPrice);


        return $this->createPayment->handle($subscription, "paystack");
    }
}
