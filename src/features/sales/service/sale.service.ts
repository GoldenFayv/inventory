import { api } from "../../../lib/api";
import type { IApiResponse } from "../../../lib/api-response.interface";
import type { IPaginatedResponse } from "../../../types/pagination.types";
import type { CreateSalePayload, IInvoice, UpdateSalePayload } from "../types/sale.types";

export const saleService = {
    async create(payload: CreateSalePayload): Promise<IInvoice> {
        const response = await api.post<IApiResponse<IInvoice>>("/sales", payload);

        return response.data.data;
    },

    async getAll(page: number = 1, search: string = ""): Promise<IPaginatedResponse<IInvoice[]>> {
        const response = await api.get<IPaginatedResponse<IInvoice[]>>("sales", {
            params: { page, ...(search.trim() ? { search: search.trim() } : {}), },
        });

        return response.data;
    },

    async getById(id: string): Promise<IInvoice> {
        const response = await api.get<IApiResponse<IInvoice>>(`sales/${id}`,);

        return response.data.data;
    },


    async update(id: string, payload: UpdateSalePayload): Promise<IInvoice> {
        const response = await api.patch<IApiResponse<IInvoice>>(`sales/${id}`, payload);

        return response.data.data;
    },

    async getOutstandingCredit(): Promise<IPaginatedResponse<IInvoice[]>> {
        const response = await api.get<IPaginatedResponse<IInvoice[]>>(
            "/sales",
            {
                params: {
                    credit: true,
                    per_page: 5,
                },
            },
        );

        return response.data;
    },

};