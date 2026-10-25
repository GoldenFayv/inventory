import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    RotateCcw,
} from "lucide-react";

export const navigation = [
    {
        label: "Home",
        to: "/",
        icon: LayoutDashboard,
        permission: null,
    },
    {
        label: "Products",
        to: "/products",
        icon: Package,
        permission: "products.view",
    },
    {
        label: "Sales",
        to: "/sales",
        icon: ShoppingCart,
        permission: "sales.view",
    },
    {
        label: "Sales Return",
        to: "/sales/returns",
        icon: RotateCcw,
        permission: "sales.return.view",
    },
    {
        label: "Settings",
        to: "/settings",
        icon: Settings,
        permission: null,
    },
];