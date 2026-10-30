<?php

namespace App\Models;

use App\Enum\StockMovementType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

#[Fillable('store_id', 'product_id', 'user_id', 'movement_type', 'quantity', 'reference_id', 'reference_type')]
class StockMovement extends Model
{
    use HasUuids;

    protected $casts = ["movement_type" => StockMovementType::class];

    protected static function booted(): void
    {
        static::created(fn(StockMovement $movement) => Product::whereKey($movement->product_id)->where('store_id', $movement->store_id)->increment('quantity', $movement->quantity));
        static::updating(fn(): never => throw new LogicException('Stock movements are immutable.'));
        static::deleting(fn(): never => throw new LogicException('Stock movements are immutable.'));
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function store(): BelongsTo
{
    return $this->belongsTo(Store::class);
}

public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
}
