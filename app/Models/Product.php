<?php

namespace App\Models;

use App\Models\Concerns\FileUpload;
use App\Models\Concerns\Searchable;
use App\Traits\BelongsToStore;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

#[Fillable('parent_id', 'store_id', 'name', 'sku', 'selling_price', 'cost_price', 'quantity', 'is_active')]
class Product extends Model implements HasMedia
{
    use HasUuids, BelongsToStore, Searchable, InteractsWithMedia, FileUpload;

    protected $casts = [
        "is_active" => "boolean"
    ];

    protected array $searchable = ['name', 'sku'];

    protected function SellingPrice(): Attribute
    {
        return Attribute::make(
            set: toKobo(...)
        );
    }

    protected function SellingPriceNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->selling_price)
        );
    }
    protected function CostPrice(): Attribute
    {
        return Attribute::make(
            set: toKobo(...)
        );
    }

    protected function CostPriceNaira(): Attribute
    {
        return Attribute::make(
            fn(): float|int => toNaira($this->cost_price)
        );
    }

    public function scopeStockStatus(Builder $query, ?string $status = null): Builder
    {
        return match ($status) {
            'in_stock'     => $query->whereColumn('quantity', '>', 'low_stock_threshold'),
            'low_stock'    => $query->where('quantity', '>', 0)->whereColumn('quantity', '<=', 'low_stock_threshold'),
            'out_of_stock' => $query->where('quantity', '<=', 0),
            default        => $query, // Returns unfiltered query if an invalid status is passed
        };
    }
}
