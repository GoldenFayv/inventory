<?php

namespace Database\Factories;

use App\Enum\BillingInterval;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $plans = ['Free Trial', 'Starter', 'Premium'];
        return [
            'name' => $this->faker->randomElement($plans),
            'description' => $this->faker->sentence(),
            // 'price' => $this->faker->numberBetween(1000, 50000),
            // 'currency' => 'NGN',
            // 'billing_interval' => $this->faker->randomElement(['monthly', 'yearly', null]),
            'for_free_trial' => $this->faker->boolean(0),
            'store_id' => null,
            'is_active' => $this->faker->boolean(85), // 85% chance of being active
        ];
    }

    // SubscriptionPlanFactory
    public function trial(int $days = 14): static
    {
        return $this->state([
            'for_free_trial'   => true,
            'trial_length'       => $days,
            'billing_interval' => null,
            'price'            => 0,
        ]);
    }

    public function monthly(): static
    {
        return $this->state(['for_free_trial' => false, 'billing_interval' => BillingInterval::MONTHLY]);
    }

    public function yearly(): static
    {
        return $this->state(['for_free_trial' => false, 'billing_interval' => BillingInterval::YEARLY]);
    }
}
