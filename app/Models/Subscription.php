<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(
    [
        'store_id',
        'starts_at',
        'ends_at',
        'status',
        'cancelled_at',
        'subscription_plan_id',
        'subscription_plan_price_id',
        'billing_interval',
        'price',
        'currency',
    ]
)]
class Subscription extends MyBaseModel
{

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'dateTime',
    ];
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function plan_price(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlanPrice::class, 'subscription_plan_price_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SubscriptionPayment::class);
    }
}
