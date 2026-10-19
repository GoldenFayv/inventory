<?php

namespace Database\Factories;

use App\Enum\SubscriptionStatus;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'store_id' => StoreFactory::new(),
            'starts_at' => null,
            'ends_at' => null,
            'cancelled_at' => null,
            'status' => SubscriptionStatus::ACTIVE,
        ];
    }
}
