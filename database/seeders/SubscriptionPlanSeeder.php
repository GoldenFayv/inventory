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
            $plan = SubscriptionPlan::updateOrCreate(
                [
                    'store_id' => null,
                    'name' => 'Free Trial',
                ],
                [
                    'description' => 'A 14-day trial with access to all features.',
                    'is_active' => true,
                    'for_free_trial' => true,
                ]
            );

            $features = [
                FeatureEnum::INVENTORY,
                FeatureEnum::SALES,
                FeatureEnum::STAFF_MANAGEMENT,
                FeatureEnum::ANALYTICS,
            ];

            foreach ($features as $feature) {
                $plan->features()->updateOrCreate(
                    ['feature' => $feature],
                    [
                        'is_enabled' => true,
                        'feature_limit' => null,
                    ]
                );
            }
        });
    }
}
