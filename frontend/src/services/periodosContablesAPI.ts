import api from "./api";
import { API_CONFIG } from "../config/api";
import {
  PaginatedResponse,
  PeriodoContableDTO,
  PeriodoContableSaveDTO,
} from "@/types/types"

export const periodosContablesAPI = {
  getAll: async (
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<PeriodoContableDTO>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES, {
            params: { Page: page, PageSize: pageSize }
      });

    return response.data;
  },

  create: async (
    data: PeriodoContableSaveDTO,
  ): Promise<PeriodoContableDTO> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES,
      data,
    )

    return response.data
  },

  update: async (
    id: number,
    data: PeriodoContableSaveDTO,
  ): Promise<PeriodoContableDTO> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES}/${id}`,
      data,
    )

    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES}/${id}`)
  },
};
