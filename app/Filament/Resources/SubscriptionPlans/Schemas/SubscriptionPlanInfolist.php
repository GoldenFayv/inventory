<?php

namespace App\Filament\Resources\SubscriptionPlans\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class SubscriptionPlanInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name')
                    ->label('Plan Name'),

                TextEntry::make('description')
                    ->placeholder('No description'),

                IconEntry::make('for_free_trial')
                    ->label('Available for Free Trial')
                    ->boolean(),

                IconEntry::make('is_active')
                    ->label('Active')
                    ->boolean(),

                TextEntry::make('prices')
                    ->label('Pricing Options')
                    ->state(fn($record): string => $record->prices
                        ->map(fn($price) => strtoupper($price->billing_interval->value) . ': ' . $price->currency . ' ' . number_format(toNaira($price->price), 2))
                        ->implode("\n"))
                    ->placeholder('No pricing options')
                    ->listWithLineBreaks(),
                TextEntry::make('features')
                    ->label('Features')
                    ->state(fn($record): array => $record->features
                        ->where('is_enabled', true)
                        ->map(fn($f) => $f->feature instanceof \BackedEnum ? $f->feature->value : $f->feature)
                        ->values()
                        ->all())
                    ->placeholder('No features configured')
                    ->listWithLineBreaks()
                    ->badge(),

                TextEntry::make('created_at')
                    ->label('Created')
                    ->dateTime()
                    ->placeholder('-'),

                TextEntry::make('updated_at')
                    ->label('Last Updated')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
