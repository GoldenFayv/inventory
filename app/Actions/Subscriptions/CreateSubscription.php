<?php

namespace App\Actions\Subscriptions;

use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPlanPrice;

class CreateSubscription
{
    public function handle(Store $store, SubscriptionPlanPrice $planPrice): Subscription
    {
        return Subscription::create([
            'store_id' => $store->getKey(),
            'subscription_plan_price_id' => $planPrice->getKey(),
            'subscription_plan_id' => $planPrice->subscription_plan_id,
            'price' => $planPrice->price,
            'currency' => $planPrice->currency,
            'billing_interval' => $planPrice->billing_interval
        ]);
    }
}
