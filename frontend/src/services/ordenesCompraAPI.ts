import api from "./api"
import { API_CONFIG } from "../config/api"
import { OrdenCompraDTO, OrdenCompraSaveDTO } from "@/types/types"

export const ordenesCompraAPI = {
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_COMPRA, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  getById: async (id: number | string): Promise<OrdenCompraDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`)
    return response.data
  },

  create: async (data: OrdenCompraSaveDTO): Promise<OrdenCompraDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.ORDENES_COMPRA, data)
    return response.data
  },

  update: async (id: number | string, data: Partial<OrdenCompraSaveDTO>): Promise<OrdenCompraDTO> => {
    console.log(`PUT Cabecera Orden #${id} - Payload:`, data)
    const response = await api.put(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`, data)
    return response.data
  },

  updateEstado: async (id: string | number, payload: { estado: string }) => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`, payload);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`)
    return response.data
  },
}