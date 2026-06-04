import api from "./api"
import { API_CONFIG } from "../config/api"
import { PaginatedResponse, FacturaVentaCompleto, FacturaVentaCompletoSave, FacturaVentaCabecera, FacturaVentaCabeceraSave } from "@/types/types"

export const facturasAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<FacturaVentaCabecera>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.INVOICES, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
    create: async (facturaData: FacturaVentaCompletoSave): Promise<FacturaVentaCabecera> => {
        const response = await api.post(`${API_CONFIG.ENDPOINTS.INVOICES}/completo`, facturaData);
        return response.data;
    },
    getById: async (facturaId: number): Promise<FacturaVentaCompleto> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.INVOICES}/${facturaId}/completo`);
        return response.data;
    },
    update: async (facturaId: number, facturaData: FacturaVentaCabeceraSave): Promise<FacturaVentaCabecera> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.INVOICES}/${facturaId}`, facturaData);
        return response.data;
    },
};
