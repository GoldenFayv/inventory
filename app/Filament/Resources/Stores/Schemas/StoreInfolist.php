<?php

namespace App\Filament\Resources\Stores\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class StoreInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('id')->label('ID'),
                TextEntry::make('name'),
                TextEntry::make('owner.first_name')->label('Owner'),
                TextEntry::make('owner.email')->label('Owner Email'),
                TextEntry::make('lga_id'),
                TextEntry::make('address'),
                TextEntry::make('zip_code'),
                TextEntry::make('parent_id')->placeholder('-'),
                TextEntry::make('created_at')->dateTime()->placeholder('-'),
                TextEntry::make('updated_at')->dateTime()->placeholder('-'),
            ]);
    }
}
