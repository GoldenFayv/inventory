<?php

namespace App\Enum;

enum SubscriptionPaymentEnum: string
{
    case PENDING = "pending";
    case FAILED = "failed";
    case SUCCESSFUL = "successful";
}
