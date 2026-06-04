import api from "./api"
import { API_CONFIG } from "../config/api"
import * as types from "@/types/types"

export const FacturasCompraAPI = {
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  getById: async (id: number): Promise<types.FacturaCompraSaveDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`)
    return response.data
  },

  create: async (data: types.FacturaCompraSaveDTO): Promise<types.FacturaCompraSaveDTO> => {
    console.log("POST Cabecera Factura - Payload:", data)
    const response = await api.post(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA, data)
    return response.data
  },

  update: async (id: number, data: Partial<types.FacturaCompraSaveDTO>): Promise<types.FacturaCompraSaveDTO> => {
    console.log(`PUT Cabecera Factura #${id} - Payload:`, data)
    const response = await api.put(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`)
    return response.data
  },

}