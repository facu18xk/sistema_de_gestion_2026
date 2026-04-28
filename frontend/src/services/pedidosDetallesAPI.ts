import api from "./api"
import { API_CONFIG } from "../config/api"
import { PedidoDetalleDTO, PedidoDetalleSaveDTO } from "@/types/types"

export const pedidosDetallesAPI = {
  getAll: async (page: number = 1, pageSize: number = 100) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PEDIDOS_DETALLES, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  create: async (data: PedidoDetalleSaveDTO): Promise<PedidoDetalleDTO> => {
  console.log("POST detalle URL:", API_CONFIG.ENDPOINTS.PEDIDOS_DETALLES)
  console.log("POST detalle data:", data)

  const response = await api.post(API_CONFIG.ENDPOINTS.PEDIDOS_DETALLES, data)
  return response.data
},

  update: async (
    idDetalle: number,
    data: PedidoDetalleSaveDTO
  ): Promise<PedidoDetalleDTO> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PEDIDOS_DETALLES}/${idDetalle}`,
      data
    )
    return response.data
  },

  delete: async (idDetalle: number): Promise<PedidoDetalleDTO> => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.PEDIDOS_DETALLES}/${idDetalle}`
    )
    return response.data
  },
}