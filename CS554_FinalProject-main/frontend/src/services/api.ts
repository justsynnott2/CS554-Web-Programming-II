import axios, { AxiosInstance, AxiosError } from 'axios';
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        const isFormData =
          typeof FormData !== 'undefined' && config.data instanceof FormData;

        if (isFormData) {
          delete (config.headers as any)['Content-Type'];
          delete (config.headers as any)['content-type'];
        } else {
          if (!(config.headers as any)['Content-Type'] && !(config.headers as any)['content-type']) {
            (config.headers as any)['Content-Type'] = 'application/json';
          }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const hasToken = !!localStorage.getItem('token');
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path && path !== '/login' && path !== '/register') {
          window.location.href = '/login';
        }
      }
      if (!error.response && hasToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path && path !== '/login' && path !== '/register') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
);

export default api;