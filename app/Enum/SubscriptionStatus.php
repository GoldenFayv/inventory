<?php

namespace App\Enum;

enum SubscriptionStatus: string
{
    case PENDING = "pending";
    case ACTIVE = "active";
    case TRIALING = "trialing";
    case CANCELLED = "cancelled";
    case expired = "expired";
}
