<?php

namespace App\Enum;

use Carbon\CarbonInterface;

enum BillingInterval: string
{
    case MONTHLY = 'monthly';
    case YEARLY  = 'yearly';
    case BI_WEEKLY = "bi-weekly";

    public function addTo(CarbonInterface $date): ?CarbonInterface
    {
        return match ($this) {
            self::MONTHLY => $date->copy()->addMonthNoOverflow(),
            self::YEARLY  => $date->copy()->addYearNoOverflow(),
            self::BI_WEEKLY  => $date->copy()->addWeeks(2),
            default => null
        };
    }
}
