// chequesMismoBancoAPI.ts

import api from "./api";
import { API_CONFIG } from "../config/api";
import type {
  ChequeMismoBanco,
  ChequeMismoBancoSaveDTO,
} from "@/types/types";

export const chequesMismoBancoAPI = {
  create: async (
    data: ChequeMismoBancoSaveDTO,
  ): Promise<ChequeMismoBanco> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.CHEQUES_MISMO_BANCO,
      data,
    );

    return response.data;
  },
};