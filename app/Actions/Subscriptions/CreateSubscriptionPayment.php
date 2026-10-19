<?php

namespace App\Actions\Subscriptions;

use App\Models\Subscription;

class CreateSubscriptionPayment
{
    public function handle(Subscription $subscription, ?string $provider = null)
    {
        return $subscription->payments()->create([
            'reference' => generateReference("SUB"),
            'amount' => $subscription->price,
            'provider' => $provider
        ]);
    }
}
