import api from './api';
import { API_CONFIG } from "../config/api";
import { Pais, Ciudad, Direccion, PaginatedResponse } from '@/types/types';

export const ubicacionesAPI = {
    // --- PAÍSES ---
    getPaises: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<Pais>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PAISES, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },

    getPaisById: async (id: number): Promise<Pais> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PAISES}/${id}`);
        return response.data;
    },

    // --- CIUDADES ---
    getCiudades: async (idPais: number, page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<Ciudad>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.CIUDADES, {
            params: {idPais: idPais, Page: page, PageSize: pageSize }
        });
        return response.data;
    },

    getCiudadById: async (id: number): Promise<Ciudad> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.CIUDADES}/${id}`);
        return response.data;
    },

    // --- DIRECCIONES ---
    createDireccion: async (data: Partial<Direccion>): Promise<Direccion> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.DIRECCIONES, data);
        return response.data;
    },

    updateDireccion: async (id: number, data: Partial<Direccion>): Promise<Direccion> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.DIRECCIONES}/${id}`, data);
        return response.data;
    },

    getDireccionById: async (id: number): Promise<Direccion> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.DIRECCIONES}/${id}`);
        return response.data;
    },

    getCiudadesPorPais: async (idPais: number) => {
        const res = await api.get(`${API_CONFIG.ENDPOINTS.CIUDADES_POR_PAIS}/${idPais}`);
        return res.data;
    }
};