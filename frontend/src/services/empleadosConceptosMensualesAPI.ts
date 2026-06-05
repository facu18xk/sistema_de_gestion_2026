import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const empleadosConceptosMensualesAPI = {
  getAll: async (
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<EmpleadoConceptoMensual>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.EMPLEADOS_CONCEPTOS_MENSUALES,
      { params: { Page: page, PageSize: pageSize } },
    );

    return response.data;
  },

  create: async (
    data: EmpleadoConceptoMensualSaveDTO,
  ): Promise<EmpleadoConceptoMensual> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.EMPLEADOS_CONCEPTOS_MENSUALES,
      data,
    );

    return response.data;
  },

  update: async (
    id: number,
    data: EmpleadoConceptoMensualSaveDTO,
  ): Promise<EmpleadoConceptoMensual> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.EMPLEADOS_CONCEPTOS_MENSUALES}/${id}`,
      data,
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.EMPLEADOS_CONCEPTOS_MENSUALES}/${id}`);
  },
};
