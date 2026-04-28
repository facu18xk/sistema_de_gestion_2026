import api from './api';
import { API_CONFIG } from "../config/api";
import { Categoria, CategoriaDTO, PaginatedResponse } from '@/types/types';

export const categoriasAPI = {
    getAll: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<Categoria>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.CATEGORIES, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    create: async (newCategory: CategoriaDTO): Promise<Categoria> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.CATEGORIES, newCategory);
        return response.data;
    },
};