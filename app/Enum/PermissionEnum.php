<?php

namespace App\Enum;

enum PermissionEnum: string
{
    case PRODUCTS_VIEW = 'products.view';
    case PRODUCTS_CREATE = 'products.create';
    case PRODUCTS_UPDATE = 'products.update';

    case SALES_CREATE = 'sales.create';
    case SALES_UPDATE = 'sales.update';
    case SALES_VIEW = 'sales.view';

    case ROLE_CREATE = 'role.create';
    case ROLE_VIEW = 'role.view';

    case DASHBOARD_VIEW = 'dashboard.view';

    case STAFF_CREATE = 'staff.create';
    case STAFF_UPDATE = 'staff.update';
    case STAFF_VIEW = 'staff.view';

    case STORE_UPDATE = 'store.update';

    public function middleware(): string
    {
        return "can.access:{$this->value}";
    }

    public function category(): PermissionCategoryEnum
    {
        return match ($this) {
            self::PRODUCTS_VIEW,
            self::PRODUCTS_CREATE,
            self::PRODUCTS_UPDATE => PermissionCategoryEnum::PRODUCT_MANAGEMENT,

            self::SALES_VIEW,
            self::SALES_CREATE,
            self::SALES_UPDATE => PermissionCategoryEnum::SALES_MANAGEMENT,

            self::ROLE_VIEW,
            self::ROLE_CREATE => PermissionCategoryEnum::ROLE_MANAGEMENT,

            self::STAFF_VIEW,
            self::STAFF_CREATE,
            self::STAFF_UPDATE => PermissionCategoryEnum::STAFF_MANAGEMENT,

            self::STORE_UPDATE => PermissionCategoryEnum::STORE_MANAGEMENT,

            self::DASHBOARD_VIEW => PermissionCategoryEnum::DASHBOARD,
        };
    }

    /** @return array<string, list<self>> permissions grouped by category value */
    public static function grouped(): array
    {
        $groups = [];

        foreach (self::cases() as $permission) {
            $groups[$permission->category()->value][] = $permission;
        }

        return $groups;
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function description(): string
    {
        return match ($this) {
            self::PRODUCTS_VIEW   => 'View store products',
            self::PRODUCTS_CREATE => 'Create new products',
            self::PRODUCTS_UPDATE => 'Update existing products',

            self::SALES_VIEW      => 'View sales records',
            self::SALES_CREATE    => 'Record sales',
            self::SALES_UPDATE    => 'Update sales records',

            self::ROLE_VIEW       => 'View roles',
            self::ROLE_CREATE     => 'Create new roles',

            self::STAFF_VIEW      => 'View staff/workers',
            self::STAFF_CREATE    => 'Create new staff/worker',
            self::STAFF_UPDATE    => 'Update staff/worker details and roles',

            self::STORE_UPDATE => 'Update store profile',

            self::DASHBOARD_VIEW  => 'View dashboard summary',
        };
    }

    public function feature(): FeatureEnum
    {
        return match ($this) {
            self::PRODUCTS_VIEW,
            self::PRODUCTS_CREATE,
            self::PRODUCTS_UPDATE => FeatureEnum::INVENTORY,

            self::SALES_VIEW,
            self::SALES_CREATE,
            self::SALES_UPDATE => FeatureEnum::SALES,

            self::ROLE_VIEW,
            self::ROLE_CREATE,
            self::STAFF_VIEW,
            self::STAFF_CREATE,
            self::STAFF_UPDATE => FeatureEnum::STAFF_MANAGEMENT,

            self::DASHBOARD_VIEW => FeatureEnum::ANALYTICS,

            default => FeatureEnum::INVENTORY,
        };
    }

    /** @return list<array{name: string, description: string, category: string, feature: string}> */
    public static function definitions(): array
    {
        return array_map(fn(self $p) => [
            'name'        => $p->value,
            'description' => $p->description(),
            'category'    => $p->category()->value,
            'feature'     => $p->feature()->value,
        ], self::cases());
    }
}
