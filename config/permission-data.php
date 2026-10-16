<?php

use App\Enum\PermissionCategoryEnum;
use App\Enum\PermissionEnum;

return [
    ['name' => PermissionEnum::PRODUCTS_VIEW->value, 'description' => 'View store products', 'category' => PermissionCategoryEnum::PRODUCT_MANAGEMENT->value, "feature" => 'inventory'],
    ['name' => PermissionEnum::PRODUCTS_CREATE->value, 'description' => 'Create new products', 'category' => PermissionCategoryEnum::PRODUCT_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::PRODUCTS_UPDATE->value, 'description' => 'Update existing products', 'category' => PermissionCategoryEnum::PRODUCT_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::PRODUCTS_DELETE->value, 'description' => 'Delete products', 'category' => PermissionCategoryEnum::PRODUCT_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::STOCK_VIEW->value, 'description' => 'View current stock', 'category' => PermissionCategoryEnum::STOCK_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::STOCK_ADJUST->value, 'description' => 'Adjust product stock', 'category' => PermissionCategoryEnum::STOCK_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::SALES_CREATE->value, 'description' => 'Record sales', 'category' => PermissionCategoryEnum::SALES_MANAGEMENT->value,  "feature" => 'inventory'],
    ['name' => PermissionEnum::SALES_VIEW->value, 'description' => 'View sales records', 'category' => PermissionCategoryEnum::SALES_MANAGEMENT->value,  "feature" => 'inventory'],
];
