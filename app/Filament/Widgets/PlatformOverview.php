<?php

namespace App\Filament\Widgets;

use App\Enum\SubscriptionPaymentEnum;
use App\Enum\SubscriptionStatus;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PlatformOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $totalStores = Store::query()->count();

        $totalUsers = User::query()->count();

        $activeSubscriptions = Subscription::query()
            ->whereIn('status', [
                SubscriptionStatus::ACTIVE->value,
                SubscriptionStatus::TRIALING->value,
            ])
            ->count();

        $successfulPayments = SubscriptionPayment::query()->where('status', SubscriptionPaymentEnum::SUCCESSFUL->value);

        $totalRevenue = $successfulPayments->sum('amount');

        return [
            Stat::make('Total Stores', number_format($totalStores))
                ->description('Registered stores')
                ->descriptionIcon('heroicon-m-building-storefront')
                ->color('primary'),

            Stat::make('Total Users', number_format($totalUsers))
                ->description('All registered accounts')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),

            Stat::make(
                'Active Subscriptions',
                number_format($activeSubscriptions)
            )
                ->description('Active and trialing subscriptions')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('success'),

            Stat::make(
                'Successful Payments',
                '₦' . number_format(toNaira($totalRevenue), 2)
            )
                ->description('Total successful subscription payments')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),
        ];
    }
}
