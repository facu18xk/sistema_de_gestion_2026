import api from './api';
import { API_CONFIG } from "../config/api";
import { StockDeposito, StockDepositoSave } from '@/types/types';

export const stocksDepositosAPI = {
    update: async (depositoId: number = 1, productoId: number, stockData: StockDepositoSave): Promise<StockDeposito> => {
        const response = await api.put(`${API_CONFIG.ENDPOINTS.STOCK}/${depositoId}/${productoId}`, stockData);
        return response.data;
    },
};