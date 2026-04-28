import api from "./api"
import { API_CONFIG } from "../config/api"
import { PedidoDTO, PedidoSaveDTO } from "@/types/types"

export const pedidosAPI = {
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PEDIDOS, {
      params: { page, pageSize },
    })
    return response.data
  },

  getById: async (id: number): Promise<PedidoDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}`)
    return response.data
  },

  create: async (data: PedidoSaveDTO): Promise<PedidoDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.PEDIDOS, data)
    return response.data
  },

  update: async (id: number, data: Partial<PedidoSaveDTO>): Promise<PedidoDTO> => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.PEDIDOS}/${id}`)
    return response.data
  },
}