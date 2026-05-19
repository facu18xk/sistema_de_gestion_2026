import api from "./api";
import { API_CONFIG } from "../config/api";
import {
  PaginatedResponse,
  PeriodoContableDTO,
} from "@/types/types"

export const periodosContablesAPI = {
  getAll: async (page = 1, pageSize = 10) => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES, {
            params: { Page: page, PageSize: pageSize }
      });

    return response.data;
  },
  delete: async (id: number): Promise<PeriodoContableDTO> => {
      const response = await api.delete(
        `${API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES}/${id}`,
      )
  
      return response.data
    },
  
};