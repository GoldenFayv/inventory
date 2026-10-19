<?php

namespace App\Enum;

enum FeatureEnum: string
{
    case INVENTORY = 'inventory';
    case SALES = 'sales';
    case STAFF_MANAGEMENT = 'staff_management';
    case ANALYTICS = 'analytics';


        public function middleware(): string
    {
        return "store.feature:{$this->value}";
    }
}
