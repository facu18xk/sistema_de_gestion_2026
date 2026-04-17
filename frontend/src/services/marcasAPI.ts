import api from './api';
import { API_CONFIG } from "../config/api";

export const marcasAPI = {
    getAll: async () => (await api.get(API_CONFIG.ENDPOINTS.BRANDS)).data
};