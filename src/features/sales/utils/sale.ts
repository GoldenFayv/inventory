import type { useSale } from "../useSales";

/** Sale shape, derived from the hook so it always matches your API types. */
export type Sale = NonNullable<ReturnType<typeof useSale>["data"]>;

export const money = (amount: number) =>
    `₦${amount.toLocaleString("en-NG")}`;

export const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

export const getBalance = (sale: Sale) =>
    Math.max(0, sale.total_amount - sale.total_amount_paid);

export function getPaymentStatus(sale: Sale) {
    if (sale.total_amount_paid >= sale.total_amount) {
        return { label: "Paid", tone: "border-primary text-primary" };
    }
    if (sale.total_amount_paid > 0) {
        return { label: "Part paid", tone: "border-amber-600 text-amber-600" };
    }
    return { label: "Unpaid", tone: "border-danger text-danger" };
}