// services/ubicacionesAPI.ts (y categoriasAPI)
import api from './api';
import { API_CONFIG } from "../config/api";
import { Pais, Ciudad, Direccion, PaginatedResponse, Categoria } from '@/types/types';

export const categoriasAPI = {
    getAll: async (page: number = 1, accumulated: Categoria[] = []): Promise<Categoria[]> => {
        const res = await api.get(API_CONFIG.ENDPOINTS.CATEGORIES, {
            params: { Page: page, PageSize: 50 }
        });
        const { items, totalPages } = res.data;
        const newAccumulated = [...accumulated, ...items];
        return page < totalPages ? categoriasAPI.getAll(page + 1, newAccumulated) : newAccumulated;
    },
    create: async (nombre: string): Promise<Categoria> => {
        const res = await api.post(API_CONFIG.ENDPOINTS.CATEGORIES, { idCategoria: 0, nombre });
        return res.data;
    }
};