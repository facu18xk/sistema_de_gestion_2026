import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  ConceptoSalario,
  ConceptoSalarioSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const conceptosSalariosAPI = {
  getAll: async (
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<ConceptoSalario>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.CONCEPTOS_SALARIOS, {
      params: { Page: page, PageSize: pageSize },
    });

    return response.data;
  },

  create: async (data: ConceptoSalarioSaveDTO): Promise<ConceptoSalario> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.CONCEPTOS_SALARIOS, data);

    return response.data;
  },

  update: async (
    id: number,
    data: ConceptoSalarioSaveDTO,
  ): Promise<ConceptoSalario> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.CONCEPTOS_SALARIOS}/${id}`,
      data,
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.CONCEPTOS_SALARIOS}/${id}`);
  },
};
