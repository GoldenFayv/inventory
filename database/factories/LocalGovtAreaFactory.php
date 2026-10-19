<?php

namespace Database\Factories;

use App\Models\LocalGovtArea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LocalGovtArea>
 */
class LocalGovtAreaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $lga = ['Ikeduru', 'Owerri west', 'Owerri north', 'Owerri south'];
        return [
            'name' => $this->faker->randomElement($lga),
            'state_id' => StateFactory::new()
        ];
    }
}
