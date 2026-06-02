import api from './api';
import { API_CONFIG } from "../config/api";
import { ProductoDTO, ProductoSaveDTO, PaginatedResponse } from '@/types/types';

export const productosAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<ProductoDTO>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    getById: async (productoId: number): Promise<ProductoDTO> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productoId}`);
        return response.data;
    },
    create: async (productoData: ProductoSaveDTO): Promise<ProductoDTO> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.PRODUCTS, productoData);
        return response.data;
    },
    update: async (productoId: number, productoData: Partial<ProductoSaveDTO>): Promise<ProductoDTO> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productoId}`, productoData);
        return response.data;
    },

    delete: async (productoId: number): Promise<ProductoDTO> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productoId}`);
        return response.data;
    }
};