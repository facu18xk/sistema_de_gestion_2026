import api from "./api"
import { API_CONFIG } from "../config/api"
import { OrdenCompraDTO, OrdenCompraSaveDTO } from "@/types/types"

export const ordenesCompraAPI = {
  // GET /api/OrdenesCompras
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_COMPRA, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  // GET /api/OrdenesCompras/{id}
  getById: async (id: number): Promise<OrdenCompraDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`)
    return response.data
  },

  // POST /api/OrdenesCompras
  create: async (data: OrdenCompraSaveDTO): Promise<OrdenCompraDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.ORDENES_COMPRA, data)
    return response.data
  },

  // PUT /api/OrdenesCompras/{id} -> Clave para cambiar a "Facturado" o editar notas
  update: async (id: number, data: Partial<OrdenCompraSaveDTO>): Promise<OrdenCompraDTO> => {
    console.log(`PUT Cabecera Orden #${id} - Payload:`, data)
    const response = await api.put(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`, data)
    return response.data
  },

  updateEstado: async (id: string | number, payload: { estado: string }) => {
    // Nota: Si tu backend usa PUT en vez de PATCH, cambia 'patch' por 'put'
    const response = await api.patch(`/ordenes-compra/${id}/estado`, payload);
    return response.data;
  },
  // DELETE /api/OrdenesCompras/{id}
  delete: async (id: number) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.ORDENES_COMPRA}/${id}`)
    return response.data
  },
}