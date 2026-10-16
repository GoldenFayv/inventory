<?php

namespace App\Enum;

enum PermissionCategoryEnum: string
{
    case PRODUCT_MANAGEMENT = "Product Management";
    case STOCK_MANAGEMENT = "Stock Management";
    case SALES_MANAGEMENT = "Sales Management";
}
