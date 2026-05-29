import api from './api';
import { API_CONFIG } from "../config/api";
import { PaginatedResponse, NotaCreditoVenta, NotaCreditoVentaSave, NotaCreditoVentaDetalle } from '@/types/types';

export const notasCreditosVentasAPI = {
    getAll: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<NotaCreditoVenta>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.NOTAS_CREDITOS_VENTAS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    create: async (notaCredito: NotaCreditoVentaSave): Promise<NotaCreditoVenta> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.NOTAS_CREDITOS_VENTAS, notaCredito);
        return response.data;
    },
    getById: async (notaCreditoId: number): Promise<NotaCreditoVenta> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.NOTAS_CREDITOS_VENTAS}/${notaCreditoId}`);
        return response.data;
    },
    getAllDetails: async (page: number = 1, pageSize: number = 30): Promise<PaginatedResponse<NotaCreditoVentaDetalle>> => {
        const response = await api.get(`${API_CONFIG.BASE_URL}/api/NotasCreditosVentasDetalles`, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
};