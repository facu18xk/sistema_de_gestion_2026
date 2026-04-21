// src/services/ubicacionesAPI.ts
import api from './api';
import { API_CONFIG } from "../config/api";
import { Pais, Ciudad, Direccion } from '@/types/types';

export const ubicacionesAPI = {
    // --- PAÍSES ---
    getPaises: async (): Promise<Pais[]> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PAISES);
        return response.data;
    },

    getPaisById: async (id: number): Promise<Pais> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PAISES}/${id}`);
        return response.data;
    },

    // --- CIUDADES ---
    // Recibe el idPais para filtrar. 
    getCiudades: async (idPais: number): Promise<Ciudad[]> => {
        // NOTA: Ajusta la URL según cómo tu backend C# reciba el filtro.
        // Opción 1 (Query Param): /api/Ciudades/?idPais=1
        const response = await api.get(`${API_CONFIG.ENDPOINTS.CIUDADES}?idPais=${idPais}`);

        // Opción 2 (Path Variable): Si tu backend usa algo como /api/Ciudades/pais/1
        // const response = await api.get(`${API_CONFIG.ENDPOINTS.CIUDADES}pais/${idPais}`);

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