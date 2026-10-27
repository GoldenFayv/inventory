import { api } from "../../../lib/api";
import type { IApiResponse } from "../../../lib/api-response.interface";
import type { IPaginatedResponse } from "../../../types/pagination.types";
import type { CreateProductPayload, ProductFormPayload, RestockProductsPayload } from "../types/product.types";
import type IProduct from "../types/product.types";

type ProductParams = {
    page?: number;
    search?: string;
    per_page?: number;
    stock?: string;
}

export const productService = {
    async getAll(params: ProductParams): Promise<IPaginatedResponse<IProduct[]>> {
        const cleanedParams = {
            page: 1,
            per_page: 10,
            ...params,
            search: params.search?.trim() ?? ""
        };

        const response = await api.get<IPaginatedResponse<IProduct[]>>("/products", {
            params: cleanedParams
        });

        return response.data;
    },

    async create(payload: CreateProductPayload): Promise<IProduct> {
        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("selling_price", String(payload.selling_price));
        formData.append("cost_price", String(payload.cost_price));
        formData.append("opening_quantity", String(payload.opening_quantity));
        formData.append(
            "low_stock_threshold",
            String(payload.low_stock_threshold),
        );

        if (payload.sku?.trim()) {
            formData.append("sku", payload.sku.trim());
        }

        payload.images?.forEach((image) => {
            formData.append("images[]", image);
        });

        const response = await api.post<IApiResponse<IProduct>>("/products", formData);

        return response.data.data;
    },

    async update(productId: string, payload: ProductFormPayload): Promise<IProduct> {
        const formData = new FormData();

        formData.append("name", payload.name);
        formData.append("sku", payload.sku ?? "");
        formData.append("selling_price", String(payload.selling_price));
        formData.append("cost_price", String(payload.cost_price));
        formData.append(
            "low_stock_threshold",
            String(payload.low_stock_threshold),
        );

        payload.images?.forEach((image) => {
            formData.append("images[]", image);
        });

        payload.remove_media_ids.forEach((id) => {
            formData.append("remove_media_ids[]", String(id));
        });

        formData.set("_method", "PATCH");

        const response = await api.post<IApiResponse<IProduct>>(`/products/${productId}`, formData);

        return response.data.data;
    },

    async toggleStatus(productId: Id): Promise<boolean> {
        await api.post(`/products/${productId}/status`);

        return true;
    },

    async getById(productId: Id): Promise<IProduct> {
        const response = await api.get<IApiResponse<IProduct>>(`products/${productId}`)

        return response.data.data
    },

    async restock(payload: RestockProductsPayload): Promise<void> {
        await api.post("/products/restock", payload);
    },

};