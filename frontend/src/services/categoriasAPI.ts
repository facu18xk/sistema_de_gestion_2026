import api from './api';
import { API_CONFIG } from "../config/api";

export const categoriasAPI = {
    getAll: async () => (await api.get(API_CONFIG.ENDPOINTS.CATEGORIES)).data
};