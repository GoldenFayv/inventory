<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Database\Factories\UserFactory;

use App\Notifications\ResetPasswordNotification;
use App\Traits\BelongsToLga;
use App\Traits\HasLoginHistory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

#[Fillable(['first_name', 'last_name', 'email', 'phone', 'phone_verified_at', 'password', 'active_store_id', 'is_super_user'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, HasName, MustVerifyEmail
{
    use HasFactory, Notifiable, HasUuids, HasLoginHistory, HasApiTokens, BelongsToLga;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_user' => 'boolean'
        ];
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_super_user;
    }

    public function getFilamentName(): string
    {
        return $this->last_name;
    }

    public function user_stores(): HasMany
    {
        return $this->hasMany(UserStore::class);
    }

    public function user_store(): HasOne
    {
        return $this->hasOne(UserStore::class)->where('store_id', $this->active_store_id);
    }

    public function store(): HasMany
    {
        return $this->hasMany(Store::class, 'owner_id');
    }

    public function active_store(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'active_store_id');
    }

    public function findForPassport(string $username): ?User
    {
        $fieldType = filter_var($username, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        return $this->where($fieldType, $username)->first();
    }

    public function stock_movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
