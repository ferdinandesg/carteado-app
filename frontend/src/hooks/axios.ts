import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
      const token = localStorage.getItem('authToken'); 
      if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      if (error.response && error.response.status === 401) {
          console.error('Sessão expirada. Faça login novamente.');
      }
      return Promise.reject(error);
  }
);

export default axiosInstance;