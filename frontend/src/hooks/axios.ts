import logger from "@/tests/utils/logger";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { signOut } from "next-auth/react";

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
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      logger.warn("Sessão expirada. Faça login novamente.");
      signOut({ callbackUrl: "/" });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
