import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  DepositoBancario,
  DepositoBancarioSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const depositosBancariosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<DepositoBancario>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.DEPOSITOS_BANCARIOS, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getById: async (id: number): Promise<DepositoBancario> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.DEPOSITOS_BANCARIOS}/${id}`,
    );
    return response.data;
  },

  create: async (data: DepositoBancarioSaveDTO): Promise<DepositoBancario> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.DEPOSITOS_BANCARIOS,
      data,
    );
    return response.data;
  },

  confirmar: async (id: number): Promise<DepositoBancario> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.DEPOSITOS_BANCARIOS}/${id}/confirmar`,
    );
    return response.data;
  },

  rechazar: async (id: number): Promise<DepositoBancario> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.DEPOSITOS_BANCARIOS}/${id}/rechazar`,
    );
    return response.data;
  },
};
