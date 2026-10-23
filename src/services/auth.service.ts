import { api, setAccessToken } from '../lib/api';
import type { IAuthApiResponse } from '../lib/api-response.interface';
import type { IAuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import type IUser from '../types/user.types';

let refreshPromise: Promise<IAuthResponse> | null = null;

export const authService = {
    async register(credentials: RegisterCredentials) {
        const response = await api.post<IAuthApiResponse<IUser>>('/auth/register', credentials,);

        setAccessToken(response.data.access_token);

        return response.data.data;
    },
    
    async login(credentials: LoginCredentials) {
        const response = await api.post<IAuthApiResponse<IAuthResponse>>('/auth/login', credentials);

        setAccessToken(response.data.access_token);

        return response.data.data;
    },

    refresh(): Promise<IAuthResponse> {
        if (!refreshPromise) {
            refreshPromise = api.post<IAuthApiResponse<IAuthResponse>>('/auth/refresh')
                .then((response) => {
                    setAccessToken(response.data.access_token);
                    return response.data.data;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise;
    },

    async me() {
        const response = await api.get<IAuthApiResponse<IUser>>('/auth/profile');

        return response.data.data;
    },

    async logout() {
        try {
            await api.delete('/auth/logout');
        } finally {
            setAccessToken(null);
        }
    },
};