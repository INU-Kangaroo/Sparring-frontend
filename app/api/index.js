import axios from "axios";
import { getTokenFromStorage, removeTokenFromStorage } from "../utils/asyncStorage"; 

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
  // withCredentials: true,
});

// 요청마다 Authorization 자동 추가
api.interceptors.request.use(
  async (config) => {
    const token = await getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 401이면 토큰 삭제(선택)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeTokenFromStorage();
      // 여기서 로그인 화면 이동 처리도 가능
    }
    return Promise.reject(error);
  }
);

export const post = (url, data, config) => api.post(url, data, config);
export const get = (url, config) => api.get(url, config);
export const put = (url, data, config) => api.put(url, data, config);
export const del = (url, config) => api.delete(url, config);

export default api;
