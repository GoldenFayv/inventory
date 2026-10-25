<?php

namespace App\Filament\Resources\SubscriptionPlans\Schemas;

use App\Enum\BillingInterval;
use App\Enum\FeatureEnum;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class SubscriptionPlanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),

                Textarea::make('description')
                    ->required()
                    ->rows(3),

                Toggle::make('for_free_trial')
                    ->label('Available for Free Trial')
                    ->default(false)
                    ->required(),

                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true)
                    ->required(),

                Repeater::make('prices')
                    // ->relationship()
                    ->label('Pricing Options')
                    ->schema([
                        Select::make('billing_interval')
                            ->options(
                                collect(BillingInterval::cases())
                                    ->mapWithKeys(fn(BillingInterval $interval) => [
                                        $interval->value => ucfirst($interval->value),
                                    ])
                                    ->all()
                            )
                            ->required(),

                        TextInput::make('price')
                            ->label('Price (₦)')
                            ->numeric()
                            ->minValue(0)
                            ->required(),
                            // ->formatStateUsing(
                            //     fn($state) => $state === null
                            //         ? null
                            //         : toNaira($state)
                            // ),

                        Select::make('currency')
                            ->options([
                                'NGN' => 'NGN — Nigerian Naira',
                            ])
                            ->default('NGN')
                            ->required(),

                        Toggle::make('is_active')
                            ->label('Price Available')
                            ->default(true)
                            ->required(),
                    ])
                    ->columns(2)
                    ->defaultItems(0)
                    ->addActionLabel('Add Pricing Option')
                    ->collapsible(),

                Repeater::make('features')
                    // ->relationship()
                    ->label('Plan Features')
                    ->schema([
                        Select::make('feature')
                            ->options(
                                collect(FeatureEnum::cases())
                                    ->mapWithKeys(fn(FeatureEnum $feature) => [
                                        $feature->value => ucfirst(
                                            str_replace('_', ' ', $feature->value)
                                        ),
                                    ])
                                    ->all()
                            )
                            ->distinct()
                            ->required(),

                        Toggle::make('is_enabled')
                            ->label('Enabled')
                            ->default(true)
                            ->required(),

                        TextInput::make('feature_limit')
                            ->label('Feature Limit')
                            ->numeric()
                            ->minValue(0)
                            ->nullable(),
                    ])
                    ->columns(3)
                    ->defaultItems(0)
                    ->addActionLabel('Add Feature')
                    ->collapsible(),
            ]);
    }
}
