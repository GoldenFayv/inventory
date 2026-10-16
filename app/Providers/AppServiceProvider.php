<?php

namespace App\Providers;

use App\Enum\MorphMapEnum;
use App\Models\Product;
use App\Models\User;
use App\Models\UserStore;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::morphMap([
            MorphMapEnum::USERSTORE->value => UserStore::class,
            MorphMapEnum::USER->value => User::class,
            MorphMapEnum::PRODUCT->value => Product::class
        ]);

        Passport::enablePasswordGrant();
        Passport::loadKeysFrom(storage_path('oauth'));
        Passport::tokensExpireIn(CarbonInterval::minutes(app()->isProduction() ? 20 : 60));
        Passport::refreshTokensExpireIn(CarbonInterval::days(30));
        // Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
    }
}
