import api from "./api"
import { API_CONFIG } from "../config/api"
import { PaginatedResponse, OrdenVenta } from "@/types/types"

export const ordenesVentasAPI = {
    getAll: async (page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<OrdenVenta>> => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_VENTAS, {
            params: { Page: page, PageSize: pageSize }
        });
        return response.data;
    },
};