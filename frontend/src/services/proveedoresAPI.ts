import api from './api';
import { API_CONFIG } from "../config/api";
import { Proveedor } from '@/types/types';

export const proveedoresAPI = {
    getAll: async (): Promise<Proveedor[]> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PROVEEDORES);
        return response.data;
    },

    getById: async (id: number): Promise<Proveedor> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`);
        return response.data;
    },

    create: async (data: Proveedor): Promise<Proveedor> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.PROVEEDORES, data);
        return response.data;
    },

    update: async (id: number, data: Proveedor): Promise<Proveedor> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`);
    }
};