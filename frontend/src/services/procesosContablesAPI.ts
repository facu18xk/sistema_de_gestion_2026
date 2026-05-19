import api from "./api"
import { API_CONFIG } from "../config/api"
import {
  PaginatedResponse,
  ProcesoContableDTO,
  ProcesoContableSaveDTO,
} from "@/types/types"

export const procesosContablesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<ProcesoContableDTO>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES, {
      params: { Page: page, PageSize: pageSize },
    })

    return response.data
  },

  getById: async (id: number): Promise<ProcesoContableDTO> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES}/${id}`,
    )

    return response.data
  },

  create: async (
    data: ProcesoContableSaveDTO)=> {

    const response = await api.post(
      API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES,
      data,
    )

    return response.data
  },

  update: async (
    id: number,
    data: ProcesoContableSaveDTO,
  ): Promise<ProcesoContableDTO> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES}/${id}`,
      data,
    )

    return response.data
  },

  delete: async (id: number): Promise<ProcesoContableDTO> => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES}/${id}`,
    )

    return response.data
  },

  generarPeriodos: async (id: number) => {
  const response = await api.post(
    `${API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES}/${id}/generar-periodos`
  );

  return response.data;
},
}