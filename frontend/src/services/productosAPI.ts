import api from './api';
import { API_CONFIG } from "../config/api";
import { Product } from '@/types/types';

export const productosAPI = {
    getAll: async (): Promise<Product[]> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS);
        return response.data;
    },
    getById: async (productoId: number): Promise<Product> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}${productoId}/`);
        return response.data;
    },
    create: async (productoData: Partial<Product>): Promise<Product> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.PRODUCTS, productoData);
        return response.data;
    },
    update: async (productoId: number, productoData: Partial<Product>): Promise<Product> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PRODUCTS}${productoId}/`, productoData);
        return response.data;
    },

    delete: async (productoId: number): Promise<Product> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}${productoId}/`);
        return response.data;
    }
};