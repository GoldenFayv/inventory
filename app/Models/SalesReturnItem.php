<?php

namespace App\Models;

use App\Enum\ProductCondition;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesReturnItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'sales_return_id',
        'invoice_item_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal',
        'condition',
        'restock_quantity',
        'damaged_quantity',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'subtotal' => 'integer',
            'restock_quantity' => 'integer',
            'damaged_quantity' => 'integer',
            'condition' => ProductCondition::class
        ];
    }

    public function salesReturn(): BelongsTo
    {
        return $this->belongsTo(SalesReturn::class);
    }

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
