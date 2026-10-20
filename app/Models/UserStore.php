<?php

namespace App\Models;

use App\Enum\SubscriptionStatus;
use App\Models\Concerns\Searchable;
use App\Traits\HasLoginHistory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Spatie\Permission\Traits\HasRoles;

#[Fillable('user_id', 'store_id', 'is_active')]
class UserStore extends MyBaseModel
{
    use HasLoginHistory, HasRoles, Searchable;

    protected array $searchable = ['user.first_name', 'user.last_name', 'user.email', 'user.phone'];

    protected $casts = ["is_active" => "boolean"];
    protected $guard_name = 'user';
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
        return $this->hasOneThrough(Subscription::class, Store::class, 'id', 'store_id', 'store_id', 'id')->whereIn('status', [SubscriptionStatus::ACTIVE, SubscriptionStatus::TRIALING])->whereDate('ends_at', '>', now());
    }
}
