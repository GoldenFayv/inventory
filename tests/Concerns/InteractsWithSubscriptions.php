<?php

namespace Tests\Concerns;

use App\Actions\Subscriptions\CreateSubscription;
use App\Enum\BillingInterval;
use App\Enum\FeatureEnum;
use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use App\Models\SubscriptionPlanPrice;
use Carbon\CarbonInterface;

trait InteractsWithSubscriptions
{
    /**
     * @param  array<FeatureEnum|array{feature: FeatureEnum, limit?: int|null, enabled?: bool}>  $features
     */
    protected function subscribeStore(Store $store, array $features = [FeatureEnum::INVENTORY], SubscriptionStatus $status = SubscriptionStatus::ACTIVE, ?SubscriptionPlanPrice $planPrice = null, array $subscriptionOverrides = []): Subscription
    {
        $planPrice ??= $this->createSubscriptionPlanPrice();

        foreach ($features as $feature) {
            // $config = $feature instanceof FeatureEnum ? ['feature' => $feature] : $feature;

            $this->createSubscriptionFeature($planPrice->plan, $feature);
        }

        $startsAt = now();

        return $this->createSubscription($planPrice, $store, $startsAt, $status, $subscriptionOverrides);
    }

    protected function createSubscription(SubscriptionPlanPrice $planPrice, Store $store, CarbonInterface $startsAt, ?SubscriptionStatus $status = null, array $subscriptionOverrides = [])
    {
        $subscription = app(CreateSubscription::class)->handle($store, $planPrice, $startsAt, $planPrice->billing_interval->addTo($startsAt), $status);
        $subscription->update($subscriptionOverrides);
        return $subscription;
    }

    protected function createSubscriptionFeature(SubscriptionPlan $plan, FeatureEnum $feature, bool $enable = true): SubscriptionPlanFeature
    {
        return SubscriptionPlanFeature::factory()->create([
            'subscription_plan_id' => $plan->getKey(),
            'feature' => $feature,
            'is_enabled' => $enable
        ]);
    }
    protected function createSubscriptionPlan(SubscriptionStatus $status): SubscriptionPlan
    {
        return SubscriptionPlan::factory()->{$status === SubscriptionStatus::TRIALING ? 'trial' : 'monthly'}()->create(['is_active' => true]);
    }

    protected function createSubscriptionPlanPrice()
    {
        return SubscriptionPlanPrice::factory()->for(SubscriptionPlan::factory(), 'plan')->create([
            "billing_interval" => BillingInterval::BI_WEEKLY,
            "price" => 0
        ]);
    }
}
