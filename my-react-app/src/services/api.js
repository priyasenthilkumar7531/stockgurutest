import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export default api;
