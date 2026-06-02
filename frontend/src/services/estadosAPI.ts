import api from './api';
import { API_CONFIG } from "../config/api";
import { Estado, PaginatedResponse } from '@/types/types';

export const estadosAPI = {
    getAll: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<Estado>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.STATUS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    }
};