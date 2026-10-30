<?php

namespace App\Enum;

enum ActivityLoggerEvent: string
{
    case PRODUCT_CREATED = 'product created';
    case PRODUCT_UPDATED = 'product updated';

    case SALE_CREATED = 'sale created';
    case SALE_UPDATED = 'sale updated';
    case SALE_CANCELLED = 'sale cancelled';

    case STOCK_MOVEMENT_RECORDED = 'stock movement recorded';

    public function description(): string
    {
        return match ($this) {
            self::PRODUCT_CREATED => 'Product Created',
            self::PRODUCT_UPDATED => 'Product Updated',

            self::SALE_CREATED => 'Sale Created',
            self::SALE_UPDATED => 'Sale Updated',
            self::SALE_CANCELLED => 'Sale Cancellation',

            self::STOCK_MOVEMENT_RECORDED => 'Stock Movement Recorded',
        };
    }

    public function logName(): string
    {
        return match ($this) {
            self::PRODUCT_CREATED,
            self::PRODUCT_UPDATED => 'inventory',

            self::SALE_CREATED,
            self::SALE_UPDATED,
            self::SALE_CANCELLED => 'sales',

            self::STOCK_MOVEMENT_RECORDED => 'inventory',
        };
    }
}
