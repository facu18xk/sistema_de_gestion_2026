import api from "./api";
import { API_CONFIG } from "@/config/api";

import {
  PaginatedResponse,
  Pariente,
  ParienteSaveDTO,
} from "@/types/types";

export const parientesAPI = {
  getAll: async (
    page = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<Pariente>> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PARIENTES,
      {
        params: {
          Page: page,
          PageSize: pageSize,
        },
      },
    );

    return response.data;
  },

  create: async (data: ParienteSaveDTO) => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PARIENTES,
      data,
    );

    return response.data;
  },

  update: async (
    id: number,
    data: ParienteSaveDTO,
  ) => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PARIENTES}/${id}`,
      data,
    );

    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.PARIENTES}/${id}`,
    );

    return response.data;
  },
};