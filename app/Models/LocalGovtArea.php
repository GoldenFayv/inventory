<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable('name', 'state_id')]
class LocalGovtArea extends Model
{
    use HasUuids;
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }
}
