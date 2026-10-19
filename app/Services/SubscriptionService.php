<?php

namespace App\Services;

use App\Actions\Subscriptions\ActivateSubscription;
use App\Actions\Subscriptions\CreateSubscription;
use App\Actions\Subscriptions\CreateSubscriptionPayment;
use App\Enum\BillingInterval;
use App\Enum\SubscriptionPaymentStatus;
use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanPrice;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    private const int PAYMENT_REUSE_MINUTES = 20;
    public function __construct(public CreateSubscription $createSubscription, public CreateSubscriptionPayment $createPayment, public ActivateSubscription $activateSubscriptionAction) {}

    public function activateTrialPlan(Store $store): SubscriptionPayment
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

            $subscription = $this->createSubscription->handle($store, $planPrice);

            $this->activateSubscription($payment = $this->createPayment->handle($subscription));

            return $payment;
        });
    }

    public function requestNonTrialPlan(Store $store, SubscriptionPlanPrice $subscriptionPlanPrice): SubscriptionPayment
    {
        Store::whereKey($store->getKey())->lockForUpdate()->firstOrFail();

        $subscription = Subscription::query()
            ->where('store_id', $store->getKey())
            ->where('subscription_plan_price_id', $subscriptionPlanPrice->getKey())
            ->where('status', SubscriptionStatus::PENDING)
            ->latest()
            ->first()
            ?? $this->createSubscription->handle($store, $subscriptionPlanPrice);

        return $subscription->payments()
            ->where('status', SubscriptionPaymentStatus::PENDING)
            ->where('created_at', '>', now()->subMinutes(self::PAYMENT_REUSE_MINUTES))
            ->latest()
            ->first()
            ?? $this->createPayment->handle($subscription);
    }

    public function activateSubscription(SubscriptionPayment $payment): Subscription
    {
        $subscription = Subscription::whereKey($payment->subscription_id)->lockForUpdate()->firstOrFail();

        if ($subscription->status !== SubscriptionStatus::PENDING) {
            throw ValidationException::withMessages([
                'payment' => 'This subscription is not awaiting payment.',
            ]);
        }

        $matches = $subscription->ends_at == null && $subscription->status === SubscriptionStatus::PENDING;

        if (!$matches) {
            throw ValidationException::withMessages([
                'payment' => 'The verified transaction does not match the pending subscription payment.',
            ]);
        }

        $startsAt = CarbonImmutable::now();
        $status = $payment->amount > 0 ? SubscriptionStatus::ACTIVE : SubscriptionStatus::TRIALING;
        $existingActiveSubscription = Subscription::where('store_id', $subscription->store_id)->whereIn('status', [SubscriptionStatus::ACTIVE, SubscriptionStatus::TRIALING, SubscriptionStatus::QUEUED])->whereDate("ends_at", ">", $startsAt)->orderByDesc('ends_at')->first();

        if ($existingActiveSubscription) {
            $startsAt = CarbonImmutable::instance($existingActiveSubscription->ends_at);
            $status = SubscriptionStatus::QUEUED;
        }

        $endsAt = $subscription->billing_interval->addTo($startsAt);

        return $this->activateSubscriptionAction->handle($subscription->fresh(), $startsAt, $endsAt, $status);
    }
}
