<?php

namespace App\Filament\Resources\Subscriptions\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SubscriptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('store_id')
                    ->relationship('store', 'name')
                    ->required(),
                DateTimePicker::make('starts_at'),
                DateTimePicker::make('ends_at'),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                TextInput::make('subscription_plan_price_id')
                    ->required(),
                TextInput::make('billing_interval'),
                TextInput::make('price')
                    ->numeric()
                    ->prefix('$'),
                TextInput::make('currency'),
                DateTimePicker::make('cancelled_at'),
                TextInput::make('subscription_plan_id')
                    ->required(),
            ]);
    }
}
