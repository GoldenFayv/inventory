<?php

namespace App\Providers;

use App\Enum\MorphMapEnum;
use App\Models\Product;
use App\Models\SalesReturn;
use App\Models\Store;
use App\Models\User;
use App\Models\UserStore;
use App\Notifications\Channels\TrackedMailChannel;
use Carbon\CarbonInterval;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Notification::extend('tracked-mail', function ($app) {
            return $app->make(TrackedMailChannel::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            MorphMapEnum::USERSTORE->value => UserStore::class,
            MorphMapEnum::USER->value => User::class,
            MorphMapEnum::PRODUCT->value => Product::class,
            MorphMapEnum::STORE->value => Store::class,
            MorphMapEnum::SALERETURN->value => SalesReturn::class,
        ]);

        Passport::enablePasswordGrant();
        env('APP_ENV') === "production" ? null: Passport::loadKeysFrom(storage_path('oauth'));
        Passport::tokensExpireIn(CarbonInterval::minutes(app()->isProduction() ? 20 : 60));
        Passport::refreshTokensExpireIn(CarbonInterval::days(30));
        // Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));

        Http::macro(
            'paystack',
           fn()=> Http::withToken(config('services.paystack.secret_key'))->acceptJson()
                ->asJson()
                ->connectTimeout(5)
                ->timeout(20)
                ->baseUrl(rtrim(config('services.paystack.base_url'), '/'))
        );
        Http::macro(
            'whatsapp',
            Http::withToken(config('services.whatsapp.access_token'))
                ->acceptJson()
                ->asJson()
                ->timeout(15)
                ->baseUrl(rtrim(config('services.whatsapp.base_url'), '/'))
        );

        Http::macro(
            'termii',
            fn(array $data) => Http::withToken(config('services.termii.api_key'))
                ->acceptJson()
                ->asJson()
                ->timeout(15)
                ->post(rtrim(config('services.termii.base_url'), '/'), $data)
        );
    }
}
