import type IProduct from "../types/product.types";


export type StockStatus = "out" | "low" | "in-stock";

export function getStockStatus(product: IProduct): StockStatus {
    if (product.quantity <= 0) {
        return "out";
    }

    if (product.quantity <= product.low_stock_threshold) {
        return "low";
    }

    return "in-stock";
}