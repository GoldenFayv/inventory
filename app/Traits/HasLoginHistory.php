<?php

namespace App\Traits;

use App\Models\LoginHistory;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasLoginHistory
{
    public function login_history(): MorphMany
    {
        return $this->morphMany(LoginHistory::class, 'reference');
    }

    public function last_login(): MorphOne
    {
        return $this->morphOne(LoginHistory::class, "reference")->latest();
    }
}
