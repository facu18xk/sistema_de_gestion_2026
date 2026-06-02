import api from "./api";
import { API_CONFIG } from "../config/api";
import type { CuentaContable, PaginatedResponse } from "@/types/types";

export const cuentasContablesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 500,
  ): Promise<PaginatedResponse<CuentaContable>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },
};
