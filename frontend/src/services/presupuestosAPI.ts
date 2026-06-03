import api from "./api"
import { API_CONFIG } from "../config/api"
import { PaginatedResponse, PresupuestoCabecera, PresupuestoCabeceraSave, PresupuestoCompleto, PresupuestoCompletoSave, PresupuestoDetalle } from "@/types/types"

export const presupuestosAPI = {
    getAll: async (page: number = 1, pageSize: number = 10, idEstado?: number): Promise<PaginatedResponse<PresupuestoCabecera>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PRESUPUESTOS, {
            params: { Page: page, PageSize: pageSize, IdEstado: idEstado }
        });
        return response.data;
    },
    create: async (presupuestoData: PresupuestoCompletoSave): Promise<PresupuestoCabecera> => {
        const response = await api.post(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/completo`, presupuestoData);
        return response.data;
    },
    getById: async (presupuestoId: number): Promise<PresupuestoCompleto> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/${presupuestoId}/completo`);
        return response.data;
    },
    update: async (presupuestoId: number, presupuestoData: PresupuestoCabeceraSave): Promise<PresupuestoCabecera> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/${presupuestoId}/completo`, presupuestoData);
        return response.data;
    },
    updateCabecera: async (presupuestoId: number, presupuestoData: PresupuestoCabeceraSave): Promise<PresupuestoCabecera> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/${presupuestoId}`, presupuestoData);
        return response.data;
    },
    delete: async (presupuestoId: number): Promise<PresupuestoCabecera> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/${presupuestoId}/completo`);
        return response.data;
    },
    deleteCabecera: async (presupuestoId: number): Promise<PresupuestoCabecera> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS}/${presupuestoId}`);
        return response.data;
    },
    deleteDetalles: async (presupuestoId: number): Promise<PresupuestoDetalle> => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.PRESUPUESTOS_DETALLES}/${presupuestoId}`);
        return response.data;
    },
};