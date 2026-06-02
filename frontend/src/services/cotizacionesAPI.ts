import api from "./api"
import { API_CONFIG } from "../config/api"
import { CotizacionDTO, CotizacionSaveDTO } from "@/types/types"

export const cotizacionesAPI = {
  getAll: async (page: number, pageSize: number) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.COTIZACIONES, {
      params: { page, pageSize },
    })
    return response.data
  },

  getById: async (id: number): Promise<CotizacionDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${id}`)
    return response.data
  },

  create: async (data: CotizacionSaveDTO): Promise<CotizacionDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.COTIZACIONES, data)
    return response.data
  },

  update: async (id: number, data: Partial<CotizacionSaveDTO>): Promise<CotizacionDTO> => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/${id}`)
    return response.data
  },


}