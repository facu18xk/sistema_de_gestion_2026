import api from "./api";
import { API_CONFIG } from "../config/api";
import type { PaginatedResponse, TipoDepositoBancario } from "@/types/types";

export const tiposDepositosBancariosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<TipoDepositoBancario>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.TIPOS_DEPOSITOS_BANCARIOS,
      { params: { Page: page, PageSize: pageSize } },
    );
    return response.data;
  },
};
