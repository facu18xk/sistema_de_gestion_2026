import api from "./api"
import { API_CONFIG } from "../config/api"
import { PaginatedResponse, PreciosVentas } from "@/types/types"

export const preciosVentasAPI = {
    getAll: async (page: number = 1, pageSize: number = 300): Promise<PaginatedResponse<PreciosVentas>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.PRECIOS_VENTAS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
};