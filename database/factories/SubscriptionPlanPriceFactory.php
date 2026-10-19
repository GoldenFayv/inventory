<?php

namespace Database\Factories;

use App\Enum\BillingInterval;
use App\Models\SubscriptionPlanPrices;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlanPrices>
 */
class SubscriptionPlanPriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $intervals = [BillingInterval::MONTHLY->value, BillingInterval::YEARLY->value];
        return [
            "subscription_plan_id" => SubscriptionPlanFactory::new(),
            "billing_interval" => $this->faker->randomElement($intervals),
            "price" => $this->faker->numberBetween(1000, 10000),
            "currency" => "NGN",
            "is_active" => $this->faker->boolean(100)
        ];
    }
}
