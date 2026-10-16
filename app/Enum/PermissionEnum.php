<?php

namespace App\Enum;

enum PermissionEnum: string
{
    case PRODUCTS_VIEW = 'products.view';
    case PRODUCTS_CREATE = 'products.create';
    case PRODUCTS_UPDATE = 'products.update';
    case PRODUCTS_DELETE = 'products.delete';

    case STOCK_VIEW = 'stock.view';
    case STOCK_ADJUST = 'stock.adjust';

    case SALES_CREATE = 'sales.create';
    case SALES_VIEW = 'sales.view';
}
