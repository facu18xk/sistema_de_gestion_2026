import api from './api';
import { API_CONFIG } from "../config/api";
import { Cliente, ClienteSaveDTO, PaginatedResponse } from '@/types/types';

export const clientesAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Cliente>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.CLIENTS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    getById: async (clienteId: number): Promise<Cliente> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clienteId}`);
        return response.data;
    },
    create: async (clienteData: ClienteSaveDTO): Promise<Cliente> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.CLIENTS, clienteData);
        return response.data;
    },
    update: async (clienteId: number, clienteData: Partial<ClienteSaveDTO>): Promise<Cliente> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clienteId}`, clienteData);
        return response.data;
    },
    delete: async (clienteId: number): Promise<Cliente> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clienteId}`);
        return response.data;
    }
};