import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  EmpleadoCargo,
  EmpleadoCargoSaveDTO,
  PaginatedResponse,
} from "@/types/types";

export const empleadosCargosAPI = {
  getAll: async (
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<EmpleadoCargo>> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.EMPLEADOS_CARGOS, {
      params: { Page: page, PageSize: pageSize },
    });

    return response.data;
  },

  create: async (data: EmpleadoCargoSaveDTO): Promise<EmpleadoCargo> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.EMPLEADOS_CARGOS, data);

    return response.data;
  },

  update: async (id: number, data: EmpleadoCargoSaveDTO): Promise<EmpleadoCargo> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.EMPLEADOS_CARGOS}/${id}`,
      data,
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.EMPLEADOS_CARGOS}/${id}`);
  },
};
