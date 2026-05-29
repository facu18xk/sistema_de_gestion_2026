import api from "./api";
import { API_CONFIG } from "../config/api";
import type { PaginatedResponse, TipoCuentaBancaria } from "@/types/types";

export const tiposCuentasBancariasAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<TipoCuentaBancaria>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.TIPOS_CUENTAS_BANCARIAS,
      { params: { Page: page, PageSize: pageSize } },
    );
    return response.data;
  },
};
