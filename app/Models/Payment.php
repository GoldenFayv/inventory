<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable('invoice_id', 'amount', 'method', 'reference')]
class Payment extends Model
{
    use HasUuids;

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    protected function Amount(): Attribute
    {
        return Attribute::make(
            set: toKobo(...)
        );
    }

    protected function AmountNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->amount)
        );
    }
}
