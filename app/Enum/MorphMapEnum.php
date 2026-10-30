<?php

namespace App\Enum;

enum MorphMapEnum: string
{
    case USERSTORE = "user_store";
    case USER = "user";
    case PRODUCT = "product";
    case STORE = "store";
    case SALERETURN = "sale_return";
    case STOCK_MOVEMENT = "stock_movement";
    case INVOICE = "invoice";
}
