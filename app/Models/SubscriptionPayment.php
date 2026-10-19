<?php

namespace App\Models;

use App\Enum\SubscriptionPaymentEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(
    'subscription_id',
    'provider',
    'reference',
    'amount',
    'currency',
    'status',
    'paid_at',
    'provider_payload',
)]

class SubscriptionPayment extends MyBaseModel
{
    protected $casts = [
        'status' => SubscriptionPaymentEnum::class,
        'amount' => 'integer',
        'paid_at' => 'datetime',
        'provider_payload' => 'array',
    ];

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function AmountNaira(): Attribute
    {
        return Attribute::make(
            get: fn(): float|int => toNaira($this->amount)
        );
    }
}
