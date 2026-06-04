import api from "./api"
import { API_CONFIG } from "../config/api"
import * as types from "@/types/types"

export const cuentasContablesAPI = {
    getAll: async (page: number, pageSize: number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },

    getById: async (id: number): Promise<types.CuentaContable> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES}/${id}`)
        return response.data
    },

    create: async (data: any): Promise<types.CuentaContable> => {
        const response = await api.post(API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES, data)
        return response.data
    },
}