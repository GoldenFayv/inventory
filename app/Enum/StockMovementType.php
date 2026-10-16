<?php

namespace App\Enum;

enum StockMovementType: string
{
    case OpeningStock   = 'opening_stock';
    case Sale = 'sale';
    case StockReceived  = 'stock_received';
    case DamagedGoods   = 'damaged_goods';
    case CustomerReturn = 'customer_return';
    
    public function signedQuantity(int $quantity): int
    {
        $quantity = abs($quantity);

        return match ($this) {
            self::OpeningStock, self::StockReceived, self::CustomerReturn => $quantity,

            self::Sale, self::DamagedGoods => -$quantity,
        };
    }
}
