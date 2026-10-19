<?php

namespace App\Models;

use App\Traits\HasLoginHistory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Spatie\Permission\Traits\HasRoles;

#[Fillable('user_id', 'store_id', 'is_active')]
class UserStore extends MyBaseModel
{
    use HasLoginHistory, HasRoles;

    protected $casts = ["is_active" => "boolean"];
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): HasOneThrough
    {
        return $this->hasOneThrough(Subscription::class, Store::class, 'id', 'store_id', 'store_id', 'id');
    }
}
