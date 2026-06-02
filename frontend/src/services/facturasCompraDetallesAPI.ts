import api from "@/services/api"
import { API_CONFIG } from "@/config/api"
import { FacturaCompraDetalleSaveDTO } from "@/types/types"
export const FacturasCompraDetallesAPI = {
    getAll: async (page: number = 1, pageSize: number = 100) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA_DETALLES, {
            params: { Page: page, PageSize: pageSize },
        })
        return response.data
    },

    // POST /api/FacturasComprasDetalles
    createDetalle: async (data: FacturaCompraDetalleSaveDTO): Promise<FacturaCompraDetalleSaveDTO> => {
        console.log("POST Detalle Factura - Payload:", data)
        const response = await api.post(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA_DETALLES, data)
        return response.data
    },

    // PUT /api/FacturasComprasDetalles/{id}
    update: async (idDetalle: number, data: FacturaCompraDetalleSaveDTO): Promise<FacturaCompraDetalleSaveDTO> => {
        console.log(`PUT Detalle Factura #${idDetalle} - Payload:`, data)
        const response = await api.put(
            `${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA_DETALLES}/${idDetalle}`,
            data
        )
        return response.data
    },

    delete: async (idDetalle: number): Promise<FacturaCompraDetalleSaveDTO> => {
        console.log(`DELETE Detalle Factura #${idDetalle}`)
        const response = await api.delete(
            `${API_CONFIG.ENDPOINTS.FACTURAS_COMPRA_DETALLES}/${idDetalle}`
        )
        return response.data
    },

    getDetallesPorOrden: async (idOrden: string | number) => {
        const response = await api.get(API_CONFIG.ENDPOINTS.FACTURAS_COMPRA_DETALLES, {
            params: { idOrdenCompra: idOrden, Page: 1, PageSize: 2000 },
        })
        return response.data
    }
}


export const facturasCompraDetallesAPI = FacturasCompraDetallesAPI