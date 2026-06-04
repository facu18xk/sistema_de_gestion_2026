import api from "./api"
import { API_CONFIG } from "../config/api"
import { NotaDevolucionCompraDTO, NotaDevolucionCompraSaveDTO, NotaDevolucionCompraDetalleSaveDTO, NotasDevolucionesComprasDetalleDTO } from "@/types/types"

export const notasDevolucionesCompraAPI = {
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  getById: async (id: number | string): Promise<NotaDevolucionCompraDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA}/${id}`)
    return response.data
  },

  create: async (data: NotaDevolucionCompraSaveDTO): Promise<NotaDevolucionCompraDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA, data)
    return response.data
  },

  createDetalle: async (data: NotaDevolucionCompraDetalleSaveDTO): Promise<NotasDevolucionesComprasDetalleDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA_DETALLES, data)
    return response.data
  },

  update: async (id: number | string, data: Partial<NotaDevolucionCompraSaveDTO>) => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA}/${id}`, data)
    return response.data
  },

  updateEstado: async (id: string | number, payload: { estado: string }) => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA}/${id}/estado`, payload);
    return response.data;
  },

  delete: async (id: number | string) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.NOTAS_DEVOLUCION_COMPRA}/${id}`)
    return response.data
  },
}