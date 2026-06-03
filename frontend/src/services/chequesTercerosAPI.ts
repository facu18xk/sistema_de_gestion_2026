// chequesTercerosAPI.ts

import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  ChequeTercero,
  ChequeTerceroSaveDTO,
} from "@/types/types";

export const chequesTercerosAPI = {
  create: async (
    data: ChequeTerceroSaveDTO,
  ): Promise<ChequeTercero> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.CHEQUES_TERCEROS,
      data,
    );

    return response.data;
  },
};