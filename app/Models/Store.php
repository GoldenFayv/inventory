<?php

namespace App\Models;

use App\Enum\FeatureEnum;
use App\Models\Concerns\HasSettings;
use App\Traits\BelongsToLga;
use Database\Factories\StoreFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

#[Fillable('name', 'lga_id', 'address', 'zip_code', 'owner_id', 'email', 'phone')]
#[UseFactory(StoreFactory::class)]
class Store extends MyBaseModel
{

    use BelongsToLga, HasSettings;

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function hasFeature(FeatureEnum $feature): bool
    {
        return once(fn(): mixed => $this->plan?->features->pluck('feature')->all() ?? [])
        |> (fn($features) => \in_array($feature, $features, true));
    }

    public function plan(): HasOneThrough
    {
        return $this->hasOneThrough(SubscriptionPlan::class, Subscription::class,  'store_id', 'id', 'id', 'subscription_plan_id');
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(UserStore::class);
    }
    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, UserStore::class, 'store_id', 'id', 'id', 'user_id');
    }
}
