import axios from "axios";

const api = axios.create({
  baseURL: "https://BACKEND_BASE_URL",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
