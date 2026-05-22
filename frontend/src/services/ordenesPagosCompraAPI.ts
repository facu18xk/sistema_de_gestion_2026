import api from "@/services/api";
import { OrdenPagoCompraSaveDTO, OrdenPagoCompraDetalleSaveDTO } from "@/types/types";

export const ordenesPagosAPI = {
    getAll: async (page = 1, pageSize = 50) => {
        const response = await api.get(`/OrdenesPagosCompras?page=${page}&pageSize=${pageSize}`);
        return response.data;
    },

    create: async (payload: OrdenPagoCompraSaveDTO) => {
        const response = await api.post("/OrdenesPagosCompras", payload);
        return response.data;
    },

    createDetalle: async (payload: OrdenPagoCompraDetalleSaveDTO) => {
        const response = await api.post("/OrdenesPagosComprasDetalles", payload);
        return response.data;
    }
};