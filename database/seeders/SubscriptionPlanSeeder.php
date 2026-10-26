<?php

namespace Database\Seeders;

use App\Actions\Subscriptions\UpsertPlan;
use App\Enum\BillingInterval;
use App\Enum\FeatureEnum;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free Trial',
                'description' => 'A 14-day trial with access to Growth Plan features.',
                'for_free_trial' => true,
                'is_active' => true,
                'features' => collect(FeatureEnum::cases())
                    ->map(fn(FeatureEnum $feature) => [
                        'feature' => $feature->value,
                        'is_enabled' => true,
                        'feature_limit' => null,
                    ])
                    ->all(),
                'prices' => [
                    [
                        'billing_interval' => BillingInterval::BI_WEEKLY->value,
                        'price' => 0,
                        'currency' => 'NGN',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'name' => 'Starter',
                'description' => 'Essential inventory and sales and credit tracking for individual shop owners.',
                'for_free_trial' => false,
                'is_active' => true,
                'features' => collect(FeatureEnum::cases())
                    ->map(fn(FeatureEnum $feature) => [
                        'feature' => $feature->value,
                        'is_enabled' => in_array(
                            $feature,
                            [
                                FeatureEnum::INVENTORY,
                                FeatureEnum::SALES,
                            ],
                            true
                        ),
                        'feature_limit' => null,
                    ])
                    ->all(),
                'prices' => [
                    [
                        'billing_interval' => BillingInterval::MONTHLY->value,
                        'price' => 10000,
                        'currency' => 'NGN',
                        'is_active' => true,
                    ],
                    [
                        'billing_interval' => BillingInterval::YEARLY->value,
                        'price' => 100000,
                        'currency' => 'NGN',
                        'is_active' => true,
                    ],
                ],
            ],
            [
                'name' => 'Growth',
                'description' => 'Complete inventory, sales, staff management and analytics for growing businesses.',
                'for_free_trial' => false,
                'is_active' => true,
                'features' => collect(FeatureEnum::cases())
                    ->map(fn(FeatureEnum $feature) => [
                        'feature' => $feature->value,
                        'is_enabled' => true,
                        'feature_limit' => null,
                    ])
                    ->all(),
                'prices' => [
                    [
                        'billing_interval' => BillingInterval::MONTHLY->value,
                        'price' => 15000,
                        'currency' => 'NGN',
                        'is_active' => true,
                    ],
                    [
                        'billing_interval' => BillingInterval::YEARLY->value,
                        'price' => 15000,
                        'currency' => 'NGN',
                        'is_active' => true,
                    ],
                ],
            ],
        ];

        DB::transaction(function () use ($plans) {
            $action = app(UpsertPlan::class);

            foreach ($plans as $data) {
                $action->handle([...$data, 'store_id' => null]);
            }
        });
    }
}
