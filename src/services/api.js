import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emitUnauthorized } from "./authEvents";

const BASE_URL = "https://efetosun.com";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * ✅ REQUEST INTERCEPTOR
 * - FormData gönderirken Content-Type kaldırılır (axios boundary koysun)
 * - JSON gönderirken application/json ayarlanır
 */
api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    // ❗ Çok kritik: RN + axios Network Error fix
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  } else {
    // JSON ise default olarak json gönder
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
    };
  }

  return config;
});

/**
 * ✅ RESPONSE INTERCEPTOR
 * - 401 / 403 durumunda token temizler
 * - Global logout tetikler
 */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err?.response?.status;

    if (status === 401 || status === 403) {
      try {
        await AsyncStorage.multiRemove([
          "token",
          "auth_token",
          "access_token",
          "jwt",
          "user",
          "auth_user",
        ]);
      } catch (e) {}

      emitUnauthorized("Lütfen tekrar giriş yapın.");
    }

    return Promise.reject(err);
  }
);
