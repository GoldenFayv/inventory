<?php

namespace App\Filament\Resources\Stores\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StoresTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('owner.first_name')
                    ->label('Owner')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('owner.email')
                    ->label('Owner Email')
                    ->searchable(),

                TextColumn::make('address')
                    ->searchable()
                    ->limit(40),

                TextColumn::make('lga_id')
                    ->label('LGA ID')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Registered')
                    ->dateTime()
                    ->sortable(),

            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                ViewAction::make(),
            ]);
    }
}
