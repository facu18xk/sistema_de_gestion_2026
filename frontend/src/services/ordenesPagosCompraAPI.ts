import api from "./api"
import { API_CONFIG } from "../config/api"
import { OrdenPagoCompraSaveDTO, OrdenPagoCompraDetalleSaveDTO } from "@/types/types"

export const ordenesPagosAPI = {
    getAll: async (page: number, pageSize: number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },
    getById: async (id: number): Promise<any> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA}/${id}`)
        return response.data
    },

    create: async (payload: OrdenPagoCompraSaveDTO) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA, payload)
        return response.data
    },

    createDetalle: async (payload: OrdenPagoCompraDetalleSaveDTO) => {
        const response = await api.post(API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA_DETALLES, payload)
        return response.data
    },

    update: async (id: number, payload: OrdenPagoCompraSaveDTO) => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA}/${id}`, payload)
        return response.data
    },
    updateEstado: async (id: number, payload: { idEstado: number }) => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA}/${id}`, payload)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA}/${id}`)
        return response.data
    },
}