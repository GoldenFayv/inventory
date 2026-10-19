<?php

namespace App\Filament\Resources\SubscriptionPayments\Tables;

use App\Enum\SubscriptionPaymentEnum;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SubscriptionPaymentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('reference')
                    ->label('Reference')
                    ->searchable()
                    ->copyable()
                    ->placeholder('No reference'),

                TextColumn::make('subscription.store.name')
                    ->label('Store')
                    ->searchable(),

                TextColumn::make('amount')
                    ->label('Amount')
                    ->formatStateUsing(
                        fn($state): string => $state === null
                            ? '—'
                            : '₦' . number_format(toNaira($state), 2)
                    )
                    ->sortable(),

                TextColumn::make('status')
                    ->badge()
                    ->color(fn(SubscriptionPaymentEnum|string $state): string => match ($state instanceof SubscriptionPaymentEnum
                        ? $state
                        : SubscriptionPaymentEnum::tryFrom($state)) {
                        SubscriptionPaymentEnum::SUCCESSFUL => 'success',
                        SubscriptionPaymentEnum::PENDING => 'warning',
                        SubscriptionPaymentEnum::FAILED => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('provider')
                    ->searchable(),

                TextColumn::make('currency')
                    ->badge(),

                TextColumn::make('paid_at')
                    ->label('Paid At')
                    ->dateTime()
                    ->sortable()
                    ->placeholder('Not paid'),

                TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
