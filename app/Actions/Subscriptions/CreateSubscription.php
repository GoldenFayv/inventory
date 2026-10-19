<?php

namespace App\Actions\Subscriptions;

use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPlanPrice;
use Carbon\Carbon;

class CreateSubscription
{
    public function handle(Store $store, SubscriptionPlanPrice $planPrice, ?Carbon $startsAt = null, ?Carbon $endsAt = null, SubscriptionStatus $status = SubscriptionStatus::ACTIVE): Subscription
    {
        return Subscription::create([
            'store_id' => $store->getKey(),
            'subscription_plan_price_id' => $planPrice->getKey(),
            'subscription_plan_id' => $planPrice->subscription_plan_id,
            'status' => $status,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'price' => $planPrice->price,
            'currency' => $planPrice->currency,
            'billing_interval' => $planPrice->billing_interval
        ]);
    }
}
