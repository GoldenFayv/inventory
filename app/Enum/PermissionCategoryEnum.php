<?php

namespace App\Enum;

enum PermissionCategoryEnum: string
{
    case PRODUCT_MANAGEMENT = "Product Management";
    case ROLE_MANAGEMENT = "Role Management";
    case STOCK_MANAGEMENT = "Stock Management";
    case SALES_MANAGEMENT = "Sales Management";
    case STAFF_MANAGEMENT = "Staff Management";
    case STORE_MANAGEMENT = "Store Management";
    case DASHBOARD = "Dashboard";
}
