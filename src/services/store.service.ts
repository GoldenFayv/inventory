
import { api } from '../lib/api';
import type { IApiResponse } from '../lib/api-response.interface';
import type { IState } from '../types/lga.types';
import type {
    CreateStorePayload,
    IStore,
} from '../types/store.types';

export const storeService = {
    async getStates(): Promise<IState[]> {
        const response = await api.get<IApiResponse<IState[]>>('states');

        return response.data.data;
    },

    async create(payload: CreateStorePayload): Promise<IStore> {
        const response = await api.post<IApiResponse<IStore>>('/stores', payload);

        return response.data.data;
    },
};
