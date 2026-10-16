<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable('invoice_id', 'product_id', 'quantity', 'unit_price', 'subtotal')]
class InvoiceItem extends Model
{
    use HasUuids;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected function UnitPriceNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->unit_price)
        );
    }

    protected function SubtotalNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->subtotal)
        );
    }
}
