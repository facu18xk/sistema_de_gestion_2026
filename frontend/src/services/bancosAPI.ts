import api from "./api";
import { API_CONFIG } from "../config/api";
import type { Banco, BancoSaveDTO, PaginatedResponse } from "@/types/types";

export const bancosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 100,
  ): Promise<PaginatedResponse<Banco>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.BANCOS, {
      params: { Page: page, PageSize: pageSize },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Banco> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.BANCOS}/${id}`);
    return response.data;
  },

  create: async (data: BancoSaveDTO): Promise<Banco> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.BANCOS, data);
    return response.data;
  },

  update: async (id: number, data: BancoSaveDTO): Promise<Banco> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.BANCOS}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.BANCOS}/${id}`);
  },
};
