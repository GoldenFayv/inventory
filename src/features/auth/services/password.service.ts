import { api } from "../../../lib/api";

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export const passwordResetService = {
    async requestReset(payload: ForgotPasswordPayload) {
        const response = await api.post("/auth/forgot-password", payload);

        return response.data;
    },

    async resetPassword(payload: ResetPasswordPayload) {
        const response = await api.post("/auth/reset-password", payload);

        return response.data;
    },
};
