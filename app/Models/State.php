<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable('name')]
class State extends Model
{
    use HasUuids;
    //

    public function local_govt_areas(): HasMany
    {
        return $this->hasMany(LocalGovtArea::class);
    }
}
