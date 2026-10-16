<?php

namespace App\Traits;

use App\Models\LocalGovtArea;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToLga
{
    public function local_govt_area(): BelongsTo
    {
        return $this->belongsTo(LocalGovtArea::class, 'lga_id')->with('state');
    }
}
