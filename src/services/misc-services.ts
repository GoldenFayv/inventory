import { api } from "../lib/api";
import type { IApiResponse } from "../lib/api-response.interface";
import type { IState } from "../types/lga.types";

export const generalService = {
    async getStates(): Promise<IState[]> {
        const response = await api.get<IApiResponse<IState[]>>('states');

        return response.data.data;
    },
}