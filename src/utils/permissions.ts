export const PermissionEnum = {
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_UPDATE: 'products.update',

    SALES_CREATE: 'sales.create',
    SALES_UPDATE: 'sales.update',
    SALES_VIEW: 'sales.view',
    SALES_RETURNS_VIEW: 'sales.returns.view',
    SALES_RETURNS_CREATE: 'sales.returns.create',
    SALES_RETURNS_APPROVE: 'sales.returns.approve',

    ROLE_CREATE: 'role.create',
    ROLE_VIEW: 'role.view',

    DASHBOARD_VIEW: 'dashboard.view',

    STAFF_CREATE: 'staff.create',
    STAFF_UPDATE: 'staff.update',
    STAFF_VIEW: 'staff.view',

    STORE_UPDATE: 'store.update',

    NOTIFICATIONS_SALES_RECEIVE: 'notifications.sales.receive',
    NOTIFICATIONS_LOW_STOCK_RECEIVE: 'notifications.low_stock.receive',
    NOTIFICATIONS_SUBSCRIPTION_RECEIVE: 'notifications.subscription.receive',
} as const;

// This generates a union type of all the values ('products.view' | 'products.create' | ...)
export type PermissionEnum = typeof PermissionEnum[keyof typeof PermissionEnum];