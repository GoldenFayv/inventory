<?php

namespace App\Models;

use App\Enum\BillingInterval;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable('name', 'description', 'for_free_trial', 'store_id', 'is_active')]
class SubscriptionPlan extends MyBaseModel
{
    protected $casts = [
        "for_free_trial" => "boolean",
        "is_active" => "boolean",
        "billing_interval" => BillingInterval::class
    ];
    public function features(): HasMany
    {
        return $this->hasMany(SubscriptionPlanFeature::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(SubscriptionPlanPrice::class, 'subscription_plan_id');
    }
}
