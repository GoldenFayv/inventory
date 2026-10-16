import type { DashboardResponse } from "./dashboard.types";

export const mockDashboardData: DashboardResponse = {
    summary: {
        sales_today: 245000,
        money_received_today: 180000,
        outstanding_credit: 680000,
        stock_value: 2400000,
        total_products: 126,
        low_stock_count: 8,
        out_of_stock_count: 3,
    },
    low_stock_products: [],
    recent_sales: [
        {
            id: "sale-001",
            invoice_number: "INV-00124",
            customer_name: "Walk-in customer",
            total_amount: 85000,
            total_amount_paid: 85000,
            created_at: new Date().toISOString(),
        },
        {
            id: "sale-002",
            invoice_number: "INV-00123",
            customer_name: "Example customer",
            total_amount: 42000,
            total_amount_paid: 20000,
            created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
    ],
    outstanding_credit_invoices: [
        {
            id: "sale-002",
            invoice_number: "INV-00123",
            customer_name: "Example customer",
            total_amount: 42000,
            total_amount_paid: 20000,
            created_at: new Date(
                Date.now() - 30 * 60 * 1000,
            ).toISOString(),
        },
    ],
};