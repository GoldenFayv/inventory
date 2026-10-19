<?php

namespace App\Filament\Resources\SubscriptionPayments\Schemas;

use App\Enum\SubscriptionPaymentStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SubscriptionPaymentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('subscription_id')
                    ->relationship('subscription', 'id')
                    ->required(),
                TextInput::make('provider'),
                TextInput::make('reference'),
                TextInput::make('amount')
                    ->required()
                    ->numeric(),
                TextInput::make('currency')
                    ->required()
                    ->default('NGN'),
                Select::make('status')
                    ->options(SubscriptionPaymentStatus::class)
                    ->default('pending')
                    ->required(),
                DateTimePicker::make('paid_at'),
                TextInput::make('provider_payload'),
            ]);
    }
}
