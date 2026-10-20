
import { api } from "../../../lib/api";
import type { IApiResponse } from "../../../lib/api-response.interface";
import type { ISubscriptionCheckout, ISubscriptionPlan, ISubscriptionTransaction, } from "../types/subscription.types";

export const subscriptionService = {
    async getPlans(): Promise<ISubscriptionPlan[]> {
        const response = await api.get<IApiResponse<ISubscriptionPlan[]>>("plans");

        return response.data.data;
    },

    async activateTrial(): Promise<ISubscriptionTransaction> {
        const response = await api.post<IApiResponse<ISubscriptionTransaction>>("subscriptions/trial");

        return response.data.data;
    },

    async subscribe(priceId: string): Promise<ISubscriptionCheckout> {
        const response = await api.post<IApiResponse<ISubscriptionCheckout>>(`plans/${priceId}/subscribe`);

        return response.data.data;
    },

    async verifyTransaction(reference: string,): Promise<ISubscriptionTransaction> {
        const response = await api.get<IApiResponse<ISubscriptionTransaction>>(`transactions/${encodeURIComponent(reference)}/verify`);

        return response.data.data;
    },
};
