import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  CuentaBancaria,
  CuentaBancariaSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const cuentasBancariasAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<CuentaBancaria>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getById: async (id: number): Promise<CuentaBancaria> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`,
    );
    return response.data;
  },

  create: async (data: CuentaBancariaSaveDTO): Promise<CuentaBancaria> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS,
      data,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: CuentaBancariaSaveDTO,
  ): Promise<CuentaBancaria> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`);
  },
};
