import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!baseURL) {
  console.warn(
    "[api] EXPO_PUBLIC_BACKEND_URL이 설정되지 않았습니다."
  );
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
