import api from "./api";
import { API_CONFIG } from "../config/api";
import type { LoginCredentials, LoginResponse } from "../types/types";
import Cookies from 'js-cookie';

export const authAPI = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const payload: LoginCredentials = { email, password }
        const response = await api.post<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, payload);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("user");
        Cookies.remove('token');
        window.location.href = '/login';
    }
}