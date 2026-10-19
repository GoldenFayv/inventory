<?php

namespace App\Actions\Subscriptions;

use App\Enum\SubscriptionStatus;
use App\Models\Subscription;
use Carbon\CarbonInterface;

class ActivateSubscription
{
    public function handle(Subscription $subscription, CarbonInterface $startsAt, CarbonInterface $endsAt, SubscriptionStatus $status): Subscription
    {
        $subscription->update([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => $status
        ]);

        return $subscription->fresh();
    }
}
