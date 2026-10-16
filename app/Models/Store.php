<?php

namespace App\Models;

use App\Traits\BelongsToLga;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable('name', 'lga_id', 'address', 'zip_code', 'owner_id')]
class Store extends Model
{

    use HasUuids, BelongsToLga;

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
