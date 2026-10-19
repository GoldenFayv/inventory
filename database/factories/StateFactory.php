<?php

namespace Database\Factories;

use App\Models\State;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<State>
 */
class StateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Option 1: Pick from actual Nigerian states
        $states = ['Lagos', 'Kano', 'Rivers', 'Imo', 'Kaduna', 'Oyo', 'Anambra', 'FCT Abuja'];

        return [
            'name' => $this->faker->randomElement($states),
        ];
    }
}
