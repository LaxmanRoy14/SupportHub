import axios from "axios";

import { store } from "../app/store.js";

export const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;

  if (accessToken && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
