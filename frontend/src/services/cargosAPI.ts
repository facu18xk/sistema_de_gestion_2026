import api from "./api";
import { API_CONFIG } from "@/config/api";
import { Cargo, CargoSaveDTO, PaginatedResponse } from "@/types/types";

export const cargosAPI = {
  getAll: async (page = 1, pageSize = 100): Promise<PaginatedResponse<Cargo>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.CARGOS, {
      params: { Page: page, PageSize: pageSize },
    });

    return response.data;
  },

  create: async (data: CargoSaveDTO): Promise<Cargo> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.CARGOS, data);

    return response.data;
  },

  update: async (id: number, data: CargoSaveDTO): Promise<Cargo> => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.CARGOS}/${id}`, data);

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.CARGOS}/${id}`);
  },
};
