<?php

namespace App\Enum;

enum SubscriptionPaymentStatus: string
{
    case PENDING = "pending";
    case FAILED = "failed";
    case SUCCESSFUL = "successful";
}
