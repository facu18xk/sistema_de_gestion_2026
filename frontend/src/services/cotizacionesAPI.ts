import api from "./api"
import { API_CONFIG } from "../config/api"
import { CotizacionCompletaSaveDTO, CotizacionDTO, CotizacionSaveDTO, CotizacionDetalleDTO } from "@/types/types"
import { cotizacionesDetallesAPI } from "./cotizacionesDetallesAPI"

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

  getByIdCompleto: async (id: number): Promise<CotizacionDTO & { detalles: CotizacionDetalleDTO[] }> => {
    // Ejecutamos ambas peticiones al mismo tiempo para optimizar la velocidad
    const [cotizacion, dataDetalles] = await Promise.all([
      cotizacionesAPI.getById(id),
      cotizacionesDetallesAPI.getAll(1, 1000)
    ])

    const listaDetalles = Array.isArray(dataDetalles)
      ? dataDetalles
      : (dataDetalles?.items || dataDetalles?.data || [])

    // Filtramos los detalles que pertenecen a esta cotización específica
    // (Asegurate de que 'idCotizacion' sea el nombre exacto de la FK que viene del backend)
    const detallesFiltrados = listaDetalles.filter(
      (d: any) => d.idCotizacion === id
    )

    // Devolvemos la cabecera con sus detalles acoplados
    return {
      ...cotizacion,
      detalles: detallesFiltrados
    }
  },

  create: async (data: CotizacionSaveDTO): Promise<CotizacionDTO> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.COTIZACIONES, data)
    return response.data
  },

  createCompleto: async (data: CotizacionCompletaSaveDTO): Promise<CotizacionDTO> => {
    const response = await api.post(`${API_CONFIG.ENDPOINTS.COTIZACIONES}/completo`, data)
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
