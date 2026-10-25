<?php

namespace Database\Seeders;

use App\Enum\FeatureEnum;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $plans = [
                [
                    'name' => 'Free Trial',
                    'description' => 'A 14-day trial with access to Growth features.',
                    'for_free_trial' => true,
                    'features' => FeatureEnum::cases(),
                ],
                [
                    'name' => 'Starter',
                    'description' => 'Essential inventory, sales and credit tracking for individual shop owners.',
                    'for_free_trial' => false,
                    'features' => [
                        FeatureEnum::INVENTORY,
                        FeatureEnum::SALES,
                        // FeatureEnum::NOTIFICATION,
                    ],
                ],
                [
                    'name' => 'Growth',
                    'description' => 'Complete inventory, sales, staff management and analytics for growing businesses.',
                    'for_free_trial' => false,
                    'features' => FeatureEnum::cases(),
                ],
            ];

            foreach ($plans as $data) {
                $enabledFeatures = collect($data['features'])
                    ->map(fn(FeatureEnum $feature) => $feature->value)
                    ->all();

                $plan = SubscriptionPlan::updateOrCreate(
                    [
                        'store_id' => null,
                        'name' => $data['name'],
                    ],
                    [
                        'description' => $data['description'],
                        'is_active' => true,
                        'for_free_trial' => $data['for_free_trial'],
                    ]
                );

                foreach (FeatureEnum::cases() as $feature) {
                    $plan->features()->updateOrCreate(
                        ['feature' => $feature],
                        [
                            'is_enabled' => in_array(
                                $feature->value,
                                $enabledFeatures,
                                true
                            ),
                            'feature_limit' => null,
                        ]
                    );
                }
            }
        });
    }
}
