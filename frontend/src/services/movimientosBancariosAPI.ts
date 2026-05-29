import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  MovimientoBancario,
  MovimientoBancarioSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const movimientosBancariosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<MovimientoBancario>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.MOVIMIENTOS_BANCARIOS,
      { params: { Page: page, PageSize: pageSize } },
    );
    return response.data;
  },

  getById: async (id: number): Promise<MovimientoBancario> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.MOVIMIENTOS_BANCARIOS}/${id}`,
    );
    return response.data;
  },

  create: async (
    data: MovimientoBancarioSaveDTO,
  ): Promise<MovimientoBancario> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.MOVIMIENTOS_BANCARIOS,
      data,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: MovimientoBancarioSaveDTO,
  ): Promise<MovimientoBancario> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.MOVIMIENTOS_BANCARIOS}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.MOVIMIENTOS_BANCARIOS}/${id}`);
  },
};
