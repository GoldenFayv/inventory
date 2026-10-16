<?php

namespace App\Models;

use App\Traits\HasLoginHistory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Traits\HasRoles;

#[Fillable('user_id', 'store_id')]
class UserStore extends Model
{
    use HasUuids, HasLoginHistory, HasRoles;

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'store_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
