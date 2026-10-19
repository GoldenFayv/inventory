<?php

namespace Database\Factories;

use App\Models\SubscriptionPlanFeature;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SubscriptionPlanFeature>
 */
class SubscriptionPlanFeatureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $features = ['inventory'];
        return [
            'subscription_plan_id' => SubscriptionPlanFactory::new(),
            'is_enabled' => $this->faker->boolean(100),
            'feature_limit' => $this->faker->randomDigit(),
            'feature' => $this->faker->randomElement($features)
        ];
    }
}
