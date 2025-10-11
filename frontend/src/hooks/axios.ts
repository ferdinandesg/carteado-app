import logger from "@/tests/utils/logger";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const correlationId = uuidv4();
      config.headers["X-Correlation-ID"] = correlationId;

      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        const decodedToken = jwt.decode(token) as { id: string; role: string };
        if (decodedToken) {
          config.headers["X-User-ID"] = decodedToken.id;
          config.headers["X-User-Role"] = decodedToken.role;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      logger.warn("Sessão expirada. Faça login novamente.");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
