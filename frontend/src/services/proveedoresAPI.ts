import api from './api';
import { API_CONFIG } from "../config/api";
import { Proveedor, ProveedorSaveDTO, PaginatedResponse } from '@/types/types';

export const proveedoresAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Proveedor>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PROVEEDORES, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },

    getById: async (id: number): Promise<Proveedor> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`);
        return response.data;
    },

    create: async (data: ProveedorSaveDTO): Promise<Proveedor> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.PROVEEDORES, data);
        return response.data;
    },

    update: async (id: number, data: ProveedorSaveDTO): Promise<Proveedor> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`${API_CONFIG.ENDPOINTS.PROVEEDORES}/${id}`);
    }
};