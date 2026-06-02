import api from './api';
import { API_CONFIG } from "../config/api";
import { PaginatedResponse, Timbrado } from '@/types/types';

export const timbradosAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Timbrado>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.TIMBRADO, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    getById: async (timbradoId: number): Promise<Timbrado> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.TIMBRADO}/${timbradoId}`);
        return response.data;
    },
};