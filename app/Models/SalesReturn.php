<?php

namespace App\Models;

use App\Enum\SalesReturnStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class SalesReturn extends MyBaseModel
{
    protected $fillable = [
        'store_id',
        'invoice_id',
        'reference',
        'status',
        'reason',
        'total_amount',
        'debt_reduction_amount',
        'customer_credit_amount',
        'requested_by',
        'approved_by',
        'approval_note',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'debt_reduction_amount' => 'integer',
            'customer_credit_amount' => 'integer',
            'approved_at' => 'datetime',
            'status' => SalesReturnStatus::class
        ];
    }

    protected function DebtReductionAmountNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->debt_reduction_amount)
        );
    }

    protected function CustomerCreditAmountNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->customer_credit_amount)
        );
    }

    protected function TotalAmountNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->total_amount)
        );
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalesReturnItem::class);
    }

    public function calculateTotals(): self
    {
        $this->attributes['total_amount'] = (int) $this->items()->sum(DB::raw('quantity * unit_price'));

        $this->save();

        return $this;
    }
}
