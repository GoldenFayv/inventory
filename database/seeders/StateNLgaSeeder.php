<?php

namespace Database\Seeders;

use App\Models\LocalGovtArea;
use App\Models\State;
use App\Models\Ward;
use Illuminate\Database\Seeder;

class StateNLgaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $filePath = database_path('full.json');

        throw_unless(is_file($filePath), \RuntimeException::class, "Seed file not found: {$filePath}");

        $jsonString = file_get_contents($filePath);
        $statesData = json_decode($jsonString, true);

        if (\is_array($statesData)) {
            foreach ($statesData as $stateItem) {
                // 1. Insert or find the State
                $state = State::updateOrCreate(
                    ['name' => $stateItem['state']]
                );

                // Loop through the LGAs under this state
                foreach ($stateItem['lgas'] as $lgaItem) {
                    // 2. Insert or find the LGA linked to the State
                    $lga = LocalGovtArea::updateOrCreate(
                        [
                            'name' => $lgaItem['name'],
                            'state_id' => $state->id // Foreign key
                        ]
                    );

                    // Loop through the Wards under this LGA
                    foreach ($lgaItem['wards'] as $wardItem) {
                        // 3. Insert or find the Ward linked to the LGA
                        Ward::updateOrCreate(
                            [
                                'name' => $wardItem['name'],
                                'lga_id' => $lga->id // Foreign key
                            ],
                            [
                                'latitude' => $wardItem['latitude'] ?? null,
                                'longitude' => $wardItem['longitude'] ?? null,
                            ]
                        );
                    }
                }
            }
        }
    }
}
