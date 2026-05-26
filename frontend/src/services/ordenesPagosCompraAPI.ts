import api from "@/services/api";
import { API_CONFIG } from "@/config/api";
import { OrdenPagoCompraSaveDTO, OrdenPagoCompraDetalleSaveDTO } from "@/types/types";

export const ordenesPagosAPI = {
    getAll: async (page: number, pageSize: number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_PAGO_COMPRA, {
            params: { Page: page, PageSize: pageSize },
        });
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