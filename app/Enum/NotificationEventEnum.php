<?php

namespace App\Enum;

enum NotificationEventEnum: string
{
    case SALE_RECORDED = 'sale_recorded';
    case LOW_STOCK = 'low_stock';
    case OUT_OF_STOCK = 'out_of_stock';
    case SUBSCRIPTION_EXPIRING = 'subscription_expiring';
    case SUBSCRIPTION_EXPIRED = 'subscription_expired';

    public function title(): string
    {
        return match ($this) {
            self::SALE_RECORDED => 'New sale recorded',
            self::LOW_STOCK => 'Low stock alert',
            self::OUT_OF_STOCK => 'Product out of stock',
            self::SUBSCRIPTION_EXPIRING => 'Subscription expiring soon',
            self::SUBSCRIPTION_EXPIRED => 'Subscription expired',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::SALE_RECORDED => 'A new sale has been recorded in your store.',

            self::LOW_STOCK => 'A product has reached its low-stock threshold.',

            self::OUT_OF_STOCK => 'A product has run out of stock.',

            self::SUBSCRIPTION_EXPIRING => 'Your store subscription is approaching its expiry date.',

            self::SUBSCRIPTION_EXPIRED => 'Your store subscription has expired.',
        };
    }
}
