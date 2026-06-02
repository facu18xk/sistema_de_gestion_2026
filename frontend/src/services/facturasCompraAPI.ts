import api from "./api"
import { API_CONFIG } from "../config/api"
// Asegúrate de que estos DTOs existan en tu archivo de tipos, o adáptalos a tus nombres exactos
import * as types from "@/types/types"

export const FacturasCompraAPI = {
  // GET /api/FacturasCompras
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  // GET /api/FacturasCompras/{id}
  getById: async (id: number): Promise<types.FacturaCompraSaveDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`)
    return response.data
  },

  // POST /api/FacturasCompras
  create: async (data: types.FacturaCompraSaveDTO): Promise<types.FacturaCompraSaveDTO> => {
    console.log("POST Cabecera Factura - Payload:", data)
    const response = await api.post(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA, data)
    return response.data
  },

  // PUT /api/FacturasCompras/{id}
  update: async (id: number, data: Partial<types.FacturaCompraSaveDTO>): Promise<types.FacturaCompraSaveDTO> => {
    console.log(`PUT Cabecera Factura #${id} - Payload:`, data)
    const response = await api.put(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`, data)
    return response.data
  },

  // DELETE /api/FacturasCompras/{id}
  delete: async (id: number) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA}/${id}`)
    return response.data
  },

}