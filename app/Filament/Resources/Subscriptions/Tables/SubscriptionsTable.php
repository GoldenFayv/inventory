<?php

namespace App\Filament\Resources\Subscriptions\Tables;

use App\Enum\SubscriptionStatus;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SubscriptionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('store.name')
                    ->label('Store')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('plan.name')
                    ->label('Plan')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn(SubscriptionStatus|string $state): string => match ($state instanceof SubscriptionStatus ? $state : SubscriptionStatus::tryFrom($state)) {
                        SubscriptionStatus::ACTIVE => 'success',
                        SubscriptionStatus::TRIALING => 'info',
                        SubscriptionStatus::PENDING => 'warning',
                        SubscriptionStatus::CANCELLED,
                        SubscriptionStatus::expired => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('billing_interval')
                    ->label('Billing Interval')
                    ->badge(),

                TextColumn::make('price')
                    ->label('Price')
                    ->formatStateUsing(
                        fn($state): string => $state === null
                            ? '—'
                            : '₦' . number_format(toNaira($state), 2)
                    )
                    ->sortable(),

                TextColumn::make('starts_at')
                    ->dateTime()
                    ->sortable(),

                TextColumn::make('ends_at')
                    ->label('Expires At')
                    ->dateTime()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
