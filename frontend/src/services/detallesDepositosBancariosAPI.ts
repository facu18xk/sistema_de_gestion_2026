import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  DetalleDepositoBancario,
  DetalleDepositoBancarioSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const detallesDepositosBancariosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<DetalleDepositoBancario>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.DETALLES_DEPOSITOS_BANCARIOS,
      {
        params: { Page: page, PageSize: pageSize },
      },
    );

    return response.data;
  },

  getById: async (id: number): Promise<DetalleDepositoBancario> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.DETALLES_DEPOSITOS_BANCARIOS}/${id}`,
    );

    return response.data;
  },

  create: async (
    data: DetalleDepositoBancarioSaveDTO,
  ): Promise<DetalleDepositoBancario> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.DETALLES_DEPOSITOS_BANCARIOS,
      data,
    );

    return response.data;
  },
};