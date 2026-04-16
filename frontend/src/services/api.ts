import axios, {AxiosInstance, InternalAxiosRequestConfig, AxiosError} from 'axios';
import { API_CONFIG } from '../config/api';
import Cookies from 'js-cookie';

//Para crear la instancia de Axios
const api: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
});

//Interceptor para agregar TOKEN
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

//Interceptor para Errores 401 (Autenticación)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Verificamos si NO es la ruta de login
    const isLoginRequest = error.config?.url?.includes(API_CONFIG.ENDPOINTS.LOGIN);
    if (error.response?.status === 401 && !isLoginRequest) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;