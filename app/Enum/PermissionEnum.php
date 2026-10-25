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
    case SALES_RETURNS_VIEW = 'sales.returns.view';
    case SALES_RETURNS_CREATE = 'sales.returns.create';
    case SALES_RETURNS_APPROVE = 'sales.returns.approve';

    case ROLE_CREATE = 'role.create';
    case ROLE_VIEW = 'role.view';

    // case DASHBOARD_VIEW = 'dashboard.view';

    case STAFF_CREATE = 'staff.create';
    case STAFF_UPDATE = 'staff.update';
    case STAFF_VIEW = 'staff.view';

    case STORE_UPDATE = 'store.update';

    case NOTIFICATIONS_SALES_RECEIVE = 'notifications.sales.receive';
    case NOTIFICATIONS_LOW_STOCK_RECEIVE = 'notifications.low_stock.receive';
    case NOTIFICATIONS_SUBSCRIPTION_RECEIVE = 'notifications.subscription.receive';

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
            self::SALES_UPDATE,
            self::SALES_RETURNS_CREATE,
            self::SALES_RETURNS_VIEW,
            self::SALES_RETURNS_APPROVE => PermissionCategoryEnum::SALES_MANAGEMENT,

            self::ROLE_VIEW,
            self::ROLE_CREATE => PermissionCategoryEnum::ROLE_MANAGEMENT,

            self::STAFF_VIEW,
            self::STAFF_CREATE,
            self::STAFF_UPDATE => PermissionCategoryEnum::STAFF_MANAGEMENT,

            self::STORE_UPDATE => PermissionCategoryEnum::STORE_MANAGEMENT,



            self::NOTIFICATIONS_SALES_RECEIVE,
            self::NOTIFICATIONS_LOW_STOCK_RECEIVE,
            self::NOTIFICATIONS_SUBSCRIPTION_RECEIVE
            => PermissionCategoryEnum::NOTIFICATION_MANAGEMENT,
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
            self::SALES_RETURNS_APPROVE => 'Approve or reject customer returns',
            self::SALES_RETURNS_CREATE => 'Request Sales Return',
            self::SALES_RETURNS_VIEW => 'View Sales Returns',

            self::ROLE_VIEW       => 'View roles',
            self::ROLE_CREATE     => 'Create new roles',

            self::STAFF_VIEW      => 'View staff/workers',
            self::STAFF_CREATE    => 'Create new staff/worker',
            self::STAFF_UPDATE    => 'Update staff/worker details and roles',

            self::STORE_UPDATE => 'Update store profile',

            self::NOTIFICATIONS_SALES_RECEIVE => 'Receive sale notifications',
            self::NOTIFICATIONS_LOW_STOCK_RECEIVE => 'Receive low-stock notifications',
            self::NOTIFICATIONS_SUBSCRIPTION_RECEIVE => 'Receive subscription notifications',
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

            default => FeatureEnum::INVENTORY,

            // self::NOTIFICATIONS_SALES_RECEIVE,
            // self::NOTIFICATIONS_LOW_STOCK_RECEIVE,
            // self::NOTIFICATIONS_SUBSCRIPTION_RECEIVE => app()->isLocal() ? FeatureEnum::INVENTORY : FeatureEnum::NOTIFICATION,

            self::SALES_RETURNS_CREATE,
            self::SALES_RETURNS_VIEW,
            self::SALES_RETURNS_APPROVE => FeatureEnum::SALES_RETURNS,
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
