<?php

namespace App\Actions\Subscriptions;

use App\Models\Subscription;
use Carbon\CarbonInterface;

class DeactivateSubscriptions
{
    public function handle(string $storeId, ?Subscription $subscription = null): void
    {
        if ($subscription) {
        }

        Subscription::query()
            ->where('store_id', $storeId)
            ->whereKeyNot($subscription->id)
            ->whereNull('ended_at')
            ->whereIn('status', ['trialing', 'active'])
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => $now,
                'ended_at' => $now,
                'updated_at' => $now,
            ]);
    }
}
