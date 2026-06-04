import api from "./api"
import { API_CONFIG } from "../config/api"
import * as types from "@/types/types"

export const cuentasBancariasAPI = {
    getAll: async (page: number, pageSize: number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },

    getById: async (id: number): Promise<types.CuentaBancaria> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`)
        return response.data
    },

    create: async (data: any): Promise<types.CuentaBancaria> => {
        console.log("POST Cuenta Bancaria - Payload:", data)
        const response = await api.post(API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS, data)
        return response.data
    },

    update: async (id: number, data: Partial<any>): Promise<types.CuentaBancaria> => {
        console.log(`PUT Cuenta Bancaria #${id} - Payload:`, data)
        const response = await api.put(`${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.CUENTAS_BANCARIAS}/${id}`)
        return response.data
    },
}