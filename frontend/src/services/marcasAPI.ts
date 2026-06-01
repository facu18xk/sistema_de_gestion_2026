import api from './api';
import { API_CONFIG } from "../config/api";
import { Marca, MarcaDTO, PaginatedResponse } from '@/types/types';

export const marcasAPI = {
    getAll: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<Marca>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.BRANDS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    create: async (newBrand: MarcaDTO): Promise<Marca> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.BRANDS, newBrand);
        return response.data;
    },
};