<?php

namespace App\Models;

use App\Enum\FeatureEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable('subscription_plan_id', 'feature', 'is_enabled', 'feature_limit')]
class SubscriptionPlanFeature extends MyBaseModel
{
    protected $casts = ['feature' => FeatureEnum::class];
}
