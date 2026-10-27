import type IMedia from "../../../types/media.types";

export default interface IProduct {
    id: Id;
    name: string;
    sku: string;
    selling_price: number;
    cost_price: number;
    quantity: number;
    low_stock_threshold: number;
    created_at?: string;
    is_active: boolean;
    media: IMedia[];
}

export interface CreateProductPayload {
    name: string;
    sku?: string | null;
    opening_quantity?: number;
    selling_price: number;
    cost_price: number;
    low_stock_threshold: number;
    images?: File[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {
    remove_media_ids?: string[];
}

export interface ProductFormPayload extends CreateProductPayload{
    // name: string;
    // sku: string | null;
    // selling_price: number;
    // cost_price: number;
    // low_stock_threshold: number;
    // opening_quantity?: number;
    // images: File[];
    remove_media_ids: Id[];
}

export interface RestockProductItem {
    product_id: Id;
    quantity: number;
}

export interface RestockProductsPayload {
    products: RestockProductItem[];
}