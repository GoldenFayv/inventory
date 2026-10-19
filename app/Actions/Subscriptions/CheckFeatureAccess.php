<?php

namespace App\Actions\Subscriptions;

use App\Enum\FeatureEnum;
use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPlanFeature;

class CheckFeatureAccess
{
    public function handle(Store $store, FeatureEnum $feature): bool
    {
        $subscription = Subscription::query()
            ->with('plan.features')
            ->where('store_id', $store->id)
            ->whereNotNull('ends_at')
            ->whereDate('ends_at', '>=', now())
            ->whereIn('status', ['trialing', 'active'])
            ->latest()
            ->first();

        if (! $subscription) {
            return false;
        }

        $now = now();

        if ($subscription->status === SubscriptionStatus::TRIALING) {
            if (! $subscription->ends_at || $now->greaterThanOrEqualTo($subscription->ends_at)) {
                return false;
            }
        }

        if ($subscription->status === SubscriptionStatus::ACTIVE) {
            if (! $subscription->ends_at || $now->greaterThanOrEqualTo($subscription->ends_at)) {
                return false;
            }
        }

        return $subscription->plan->features->contains(fn(SubscriptionPlanFeature $item): bool => $item->feature === $feature && $item->is_enabled);
    }
}
