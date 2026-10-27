import { api } from "../../../lib/api";


export const emailVerificationService = {
    async sendVerificationLink(): Promise<void> {
        await api.post("/auth/email/verification");
    }
};
