import api from "./api"
import { API_CONFIG } from "../config/api"
import { OrdenCompraDetalleDTO, OrdenCompraDetalleSaveDTO } from "@/types/types"

export const ordenesCompraDetallesAPI = {
    // GET /api/OrdenesComprasDetalles
    getAll: async (page: number = 1, pageSize: number = 100) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.ORDENES_COMPRA_DETALLES, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },

    // POST /api/OrdenesComprasDetalles
    create: async (data: OrdenCompraDetalleSaveDTO): Promise<OrdenCompraDetalleDTO> => {
        console.log("POST Detalle Orden - Payload:", data)
        const response = await api.post(API_CONFIG.ENDPOINTS.ORDENES_COMPRA_DETALLES, data)
        return response.data
    },

    // PUT /api/OrdenesComprasDetalles/{id} -> Para modificar la cantidad directamente
    update: async (idDetalle: number, data: OrdenCompraDetalleSaveDTO): Promise<OrdenCompraDetalleDTO> => {
        console.log(`PUT Detalle Orden #${idDetalle} - Payload:`, data)
        const response = await api.put(
            `${API_CONFIG.ENDPOINTS.ORDENES_COMPRA_DETALLES}/${idDetalle}`,
            data
        )
        return response.data
    },

    // DELETE /api/OrdenesComprasDetalles/{id} -> Crucial para remover ítems de la orden
    delete: async (idDetalle: number): Promise<OrdenCompraDetalleDTO> => {
        console.log(`DELETE Detalle Orden #${idDetalle}`)
        const response = await api.delete(
            `${API_CONFIG.ENDPOINTS.ORDENES_COMPRA_DETALLES}/${idDetalle}`
        )
        return response.data
    },
}