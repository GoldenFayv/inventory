<?php

namespace App\Models;

use App\Enum\SubscriptionPaymentStatus;
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
        'status' => SubscriptionPaymentStatus::class,
        'amount' => 'integer',
        'paid_at' => 'datetime',
        'provider_payload' => 'array',
        'reference' => 'string'
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

    public function isSuccessful(): bool
    {
        return $this->status === SubscriptionPaymentStatus::SUCCESSFUL && $this->paid_at !== null;
    }
}
