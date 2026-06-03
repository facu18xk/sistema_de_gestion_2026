import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  ChequeEmitido,
  ChequeEmitidoSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export interface ConciliarChequeRequest {
  fechaPago: string;
}

export const chequesEmitidosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<ChequeEmitido>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.CHEQUES_EMITIDOS, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getById: async (id: number): Promise<ChequeEmitido> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.CHEQUES_EMITIDOS}/${id}`,
    );
    return response.data;
  },

  create: async (data: ChequeEmitidoSaveDTO): Promise<ChequeEmitido> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.CHEQUES_EMITIDOS,
      data,
    );
    return response.data;
  },

  conciliar: async (
    id: number,
    data: ConciliarChequeRequest,
  ): Promise<ChequeEmitido> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.CHEQUES_EMITIDOS}/${id}/conciliar`,
      data,
    );
    return response.data;
  },
};
