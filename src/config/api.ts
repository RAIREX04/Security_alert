import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { env } from './env';

let currentAccessToken: string | null = null;
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retriedWithFallback?: boolean;
};

function isLoopbackUrl(url: string) {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?(\/|$)/i.test(url);
}

function canUseFallback() {
  if (!env.apiFallbackUrl) return false;
  if (Platform.OS !== 'web' && isLoopbackUrl(env.apiFallbackUrl)) {
    return false;
  }
  return true;
}

export const api = axios.create({
  baseURL: env.apiBaseUrl.replace(/\/+$/, ''),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (currentAccessToken) {
    const headers = config.headers ?? new AxiosHeaders();
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    if (
      (!error.response || (status != null && status >= 500))
      && config
      && !config._retriedWithFallback
      && canUseFallback()
      && api.defaults.baseURL !== env.apiFallbackUrl
    ) {
      config._retriedWithFallback = true;
      config.baseURL = env.apiFallbackUrl.replace(/\/+$/, '');
      return api.request(config);
    }

    return Promise.reject(error);
  },
);

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAccessToken() {
  return currentAccessToken;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const method = axiosError.config?.method?.toUpperCase();
    const url = axiosError.config?.url;
    const baseURL = axiosError.config?.baseURL || env.apiBaseUrl;
    const endpoint = [method, `${baseURL}${url ?? ''}`].filter(Boolean).join(' ');
    const message = axiosError.response?.data?.message || axiosError.message || 'Terjadi kesalahan jaringan.';
    return endpoint ? `${message} (${endpoint})` : message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
}
