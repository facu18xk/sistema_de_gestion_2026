import api from "./api";
import { API_CONFIG } from "../config/api";
import type { PaginatedResponse, TipoMovimientoBancario } from "@/types/types";

export const tiposMovimientosBancariosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<TipoMovimientoBancario>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.TIPOS_MOVIMIENTOS_BANCARIOS,
      { params: { Page: page, PageSize: pageSize } },
    );
    return response.data;
  },
};
