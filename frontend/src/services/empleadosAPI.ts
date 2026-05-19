import api from "./api"
import { API_CONFIG } from "../config/api"
import {
  Empleado,
  EmpleadoSaveDTO,
  PaginatedResponse,
} from "@/types/types"

export const empleadosAPI = {
  getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Empleado>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.EMPLEADOS, {
      params: { Page: page, PageSize: pageSize },
    })

    return response.data
  },

  getById: async (idEmpleado: number): Promise<Empleado> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.EMPLEADOS}/${idEmpleado}`,
    )

    return response.data
  },

  create: async (data: EmpleadoSaveDTO): Promise<Empleado> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.EMPLEADOS, data)

    return response.data
  },

  update: async (
    idEmpleado: number,
    data: EmpleadoSaveDTO,
  ): Promise<Empleado> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.EMPLEADOS}/${idEmpleado}`,
      data,
    )

    return response.data
  },

  delete: async (idEmpleado: number): Promise<Empleado> => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.EMPLEADOS}/${idEmpleado}`,
    )

    return response.data
  },
}