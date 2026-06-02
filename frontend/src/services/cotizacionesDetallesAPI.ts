import api from "./api"
import { API_CONFIG } from "../config/api"
import { CotizacionDetalleDTO, CotizacionDetalleSaveDTO } from "@/types/types"

export const cotizacionesDetallesAPI = {
  getAll: async (page: number = 1, pageSize: number = 100) => {
    const response = await api.get(API_CONFIG.ENDPOINTS.COTIZACIONES_DETALLES, {
      params: { Page: page, PageSize: pageSize },
    })
    return response.data
  },

  create: async (data: CotizacionDetalleSaveDTO): Promise<CotizacionDetalleDTO> => {
    console.log("POST detalle - Payload final enviado al Backend:", data);
    const response = await api.post(API_CONFIG.ENDPOINTS.COTIZACIONES_DETALLES, data);
    return response.data;
  },

  update: async (idDetalle: number, data: CotizacionDetalleSaveDTO): Promise<CotizacionDetalleDTO> => {
    console.log("PUT detalle - Payload final enviado al Backend:", data);
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.COTIZACIONES_DETALLES}/${idDetalle}`,
      data
    );
    return response.data;
  },

  delete: async (idDetalle: number): Promise<CotizacionDetalleDTO> => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.COTIZACIONES_DETALLES}/${idDetalle}`
    );
    return response.data;
  },
}