import api from "./api";
import { API_CONFIG } from "../config/api";
import * as types from "@/types/types";

export const notasCreditosCompraAPI = {
    getAll: async (page: number = 1, pageSize: number = 100) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.NOTAS_CREDITO_COMPRA, {
            params: { Page: page, PageSize: pageSize },
        });
        return response.data;
    },

    getById: async (id: number): Promise<types.NotaCreditoCompraDTO> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.NOTAS_CREDITO_COMPRA}/${id}`);
        return response.data;
    },

    create: async (data: types.NotaCreditoCompraSaveDTO): Promise<types.NotaCreditoCompraDTO> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.NOTAS_CREDITO_COMPRA, data);
        return response.data;
    },

    update: async (id: number, data: types.NotaCreditoCompraSaveDTO): Promise<types.NotaCreditoCompraDTO> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.NOTAS_CREDITO_COMPRA}/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.NOTAS_CREDITO_COMPRA}/${id}`);
        return response.data;
    },
};