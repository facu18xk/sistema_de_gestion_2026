import api from './api';
import { API_CONFIG } from "../config/api";
import { PaginatedResponse, MedioPago } from '@/types/types';

export const mediosPagosAPI = {
    getAll: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<MedioPago>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.MEDIOS_PAGO, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
};