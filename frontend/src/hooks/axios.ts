import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
      if (error.response && error.response.status === 401) {
          console.error('Sessão expirada. Faça login novamente.');
      }
      return Promise.reject(error);
  }
);

export default axiosInstance;