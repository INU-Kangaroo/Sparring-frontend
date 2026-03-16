import axios, {
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  getAccessTokenFromStorage,
  getRefreshTokenFromStorage,
  removeTokenFromStorage,
  setTokensToStorage,
} from "../utils/asyncStorage";

const baseURL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

console.log("[API] baseURL =", baseURL);
console.log(
  "[API] EXPO_PUBLIC_BACKEND_URL =",
  process.env.EXPO_PUBLIC_BACKEND_URL
);
console.log(
  "[API] EXPO_PUBLIC_API_BASE_URL =",
  process.env.EXPO_PUBLIC_API_BASE_URL
);

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const url = config.url ?? "";

    console.log("[API Request] baseURL =", config.baseURL);
    console.log("[API Request] url =", url);
    console.log("[API Request] method =", config.method);
    console.log("[API Request] data =", config.data);

    const isPublicAuthRequest =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/sign-up") ||
      url.includes("/api/auth/send-verification") ||
      url.includes("/api/auth/verify-code") ||
      url.includes("/api/auth/oauth2/") ||
      url.includes("/api/auth/social/complete") ||
      url.includes("/api/auth/refresh");

    if (isPublicAuthRequest) {
      return config;
    }

    const token = await getAccessTokenFromStorage();
    if (!token) return config;

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function doRefresh() {
  const refreshToken = await getRefreshTokenFromStorage();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await axios.post(
    `${baseURL}/api/auth/refresh`,
    {},
    { headers: { "X-Refresh-Token": refreshToken } }
  );

  const data = res.data?.data ?? res.data;
  const newAccess = data?.accessToken ?? data?.token;
  const newRefresh = data?.refreshToken;

  if (!newAccess) throw new Error("Refresh response missing accessToken");

  await setTokensToStorage(newAccess, newRefresh);
  return newAccess as string;
}

api.interceptors.response.use(
  (res) => {
    console.log("[API Response] status =", res.status);
    console.log("[API Response] url =", res.config?.url);
    console.log("[API Response] data =", res.data);
    return res;
  },
  async (error) => {
    console.log("[API Error] message =", error?.message);
    console.log("[API Error] code =", error?.code);
    console.log("[API Error] status =", error?.response?.status);
    console.log("[API Error] data =", error?.response?.data);
    console.log("[API Error] url =", error?.config?.url);
    console.log("[API Error] baseURL =", error?.config?.baseURL);

    const status = error?.response?.status;
    const original = error?.config as AxiosRequestConfig & { _retry?: boolean };
    const url = original?.url ?? "";

    const isPublicAuthRequest =
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/signup") ||
      url.includes("/api/auth/sign-up") ||
      url.includes("/api/auth/send-verification") ||
      url.includes("/api/auth/verify-code") ||
      url.includes("/api/auth/oauth2/") ||
      url.includes("/api/auth/social/complete") ||
      url.includes("/api/auth/refresh");

    if (status !== 401 || original?._retry || isPublicAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (isRefreshing) {
        const newToken = await new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        });

        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${newToken}`,
        } as any;
        return api.request(original);
      }

      isRefreshing = true;
      const newToken = await doRefresh();
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      original.headers = {
        ...(original.headers ?? {}),
        Authorization: `Bearer ${newToken}`,
      } as any;

      return api.request(original);
    } catch (e) {
      await removeTokenFromStorage();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export const post = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => api.post(url, data, config);

export const get = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => api.get(url, config);

export const patch = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => api.patch(url, data, config);

export const put = <T = any>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => api.put(url, data, config);

export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => api.delete(url, config);

export default api;