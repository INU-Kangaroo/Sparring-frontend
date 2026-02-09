// app/api/index.ts
import axios, {
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getTokenFromStorage, removeTokenFromStorage } from "../utils/asyncStorage";

const baseURL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

if (!process.env.EXPO_PUBLIC_BACKEND_URL && !process.env.EXPO_PUBLIC_API_BASE_URL) {
  console.warn(
    "[api] EXPO_PUBLIC_BACKEND_URL 또는 EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다. 기본값(http://localhost:8080)을 사용합니다."
  );
}

const api: AxiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// 요청마다 Authorization 자동 추가
api.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromStorage();
    if (!token) return config;

    // Axios v1: headers 타입이 object 또는 AxiosHeaders 일 수 있음
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

// 401이면 토큰 삭제(선택)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeTokenFromStorage();
      // TODO: 필요하면 여기서 로그인 화면 이동 처리
    }
    return Promise.reject(error);
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
