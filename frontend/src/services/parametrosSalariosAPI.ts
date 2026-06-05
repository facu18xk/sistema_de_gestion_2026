import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  PaginatedResponse,
  ParametroSalario,
  ParametroSalarioSaveDTO,
} from "@/types/types";

export const parametrosSalariosAPI = {
  getAll: async (
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<ParametroSalario>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PARAMETROS_SALARIOS, {
      params: { Page: page, PageSize: pageSize },
    });

    return response.data;
  },

  create: async (data: ParametroSalarioSaveDTO): Promise<ParametroSalario> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.PARAMETROS_SALARIOS, data);

    return response.data;
  },

  update: async (
    id: number,
    data: ParametroSalarioSaveDTO,
  ): Promise<ParametroSalario> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PARAMETROS_SALARIOS}/${id}`,
      data,
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.PARAMETROS_SALARIOS}/${id}`);
  },
};
