<?php

namespace App\Models;

use App\Enum\BillingInterval;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(
    'subscription_plan_id',
    'billing_interval',
    'price',
    'currency',
    'is_active',
)]
class SubscriptionPlanPrice extends MyBaseModel
{
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'is_active' => 'boolean',
            'billing_interval' => BillingInterval::class
        ];
    }

    public function Price(): Attribute
    {
        return Attribute::make(
            set: toKobo(...)
        );
    }

    public function PriceNaira(): Attribute
    {
        return Attribute::make(
            get: fn(): float|int => toNaira($this->price)
        );
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'subscription_plan_price_id');
    }
}
