// services/ubicacionesAPI.ts
import api from './api';
import { API_CONFIG } from "../config/api";
import { Pais, Ciudad, Direccion, PaginatedResponse } from '@/types/types';

export const ubicacionesAPI = {
    // Cambiamos el nombre de vuelta a getPaises para que coincida con tu página
    // pero le agregamos la lógica recursiva interna
    getPaises: async (page: number = 1, accumulated: Pais[] = []): Promise<any> => {
        const res = await api.get(API_CONFIG.ENDPOINTS.PAISES, {
            params: { Page: page, PageSize: 50 }
        });

        // El backend devuelve { items: [], totalPages: X }
        const { items, totalPages } = res.data;
        const newAccumulated = [...accumulated, ...items];

        if (page < totalPages) {
            return ubicacionesAPI.getPaises(page + 1, newAccumulated);
        }

        // Importante: devolvemos el formato que el .map del componente espera
        return { items: newAccumulated };
    },

    getCiudadesPorPais: async (idPais: number) => {
        const res = await api.get(`${API_CONFIG.ENDPOINTS.CIUDADES_POR_PAIS}/${idPais}`);
        return res.data;
    },

    createPais: async (data: { nombre: string }): Promise<Pais> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.PAISES, { idPais: 0, nombre: data.nombre });
        return response.data;
    },

    createCiudad: async (data: { nombre: string, idPais: number }): Promise<Ciudad> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.CIUDADES, { idCiudad: 0, nombre: data.nombre, idPais: data.idPais });
        return response.data;
    }
};