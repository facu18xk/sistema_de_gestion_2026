import api from "./api"
import { API_CONFIG } from "../config/api"
import * as types from "@/types/types"

export const bancosAPI = {
    getAll: async (page: number, pageSize: number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.BANCOS, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },

    getById: async (id: number): Promise<any> => {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.BANCOS}/${id}`)
        return response.data
    },

    create: async (data: any): Promise<any> => {
        console.log("POST Banco - Payload:", data)
        const response = await api.post(API_CONFIG.ENDPOINTS.BANCOS, data)
        return response.data
    },

    update: async (id: number, data: Partial<any>): Promise<any> => {
        console.log(`PUT Banco #${id} - Payload:`, data)
        const response = await api.put(`${API_CONFIG.ENDPOINTS.BANCOS}/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        const response = await api.delete(`${API_CONFIG.ENDPOINTS.BANCOS}/${id}`)
        return response.data
    },
}