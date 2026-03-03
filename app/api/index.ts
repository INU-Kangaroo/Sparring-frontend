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

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// accessToken 자동 첨부
api.interceptors.request.use(async (config) => {
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
});

// 401 -> refresh 시도(1회) -> 실패하면 토큰 제거
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function doRefresh() {
  const refreshToken = await getRefreshTokenFromStorage();
  if (!refreshToken) throw new Error("No refresh token");

  // 명세: POST /api/auth/refresh + 헤더 X-Refresh-Token
  const res = await axios.post(
    `${baseURL}/api/auth/refresh`,
    {},
    { headers: { "X-Refresh-Token": refreshToken } }
  );

  // 백엔드 응답 형태는 프로젝트마다 달라서 유연하게 처리
  const data = res.data?.data ?? res.data;
  const newAccess = data?.accessToken ?? data?.token;
  const newRefresh = data?.refreshToken;

  if (!newAccess) throw new Error("Refresh response missing accessToken");

  await setTokensToStorage(newAccess, newRefresh);
  return newAccess as string;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config as AxiosRequestConfig & { _retry?: boolean };

    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (isRefreshing) {
        const newToken = await new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        });

        // 새 토큰으로 재요청
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