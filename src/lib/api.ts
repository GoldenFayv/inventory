
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { authService } from '../services/auth.service';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let accessToken: string | null = null;

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    // let the browser set multipart/form-data with its boundary
    delete config.headers["Content-Type"];
    return config;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest.url ?? '';

    // Never attempt to refresh in response to failures from
    // endpoints that manage authentication itself.
    const isAuthEndpoint = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ].some((endpoint) => url.includes(endpoint));

    if (isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await authService.refresh();

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);

      window.dispatchEvent(
        new Event('auth:session-expired'),
      );

      return Promise.reject(refreshError);
    }
  },
);