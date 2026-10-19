<?php

namespace App\Filament\Resources\Stores\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class StoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('owner_id')
                    ->required(),
                TextInput::make('lga_id')
                    ->required(),
                TextInput::make('address')
                    ->required(),
                TextInput::make('zip_code')
                    ->required(),
                TextInput::make('parent_id'),
            ]);
    }
}
