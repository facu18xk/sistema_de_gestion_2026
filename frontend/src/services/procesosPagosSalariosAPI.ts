import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  CerrarProcesoPagoSalarioDTO,
  PaginatedResponse,
  PagoSalarioDetalle,
  PagoSalarioDetalleSaveDTO,
  ProcesoPagoSalario,
  ProcesoPagoSalarioSaveDTO,
  ReciboPagoSalario,
} from "@/types/types";

const baseUrl = API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS;

export const procesosPagosSalariosAPI = {
  getAll: async (
    page = 1,
    pageSize = 100,
  ): Promise<PaginatedResponse<ProcesoPagoSalario>> => {
    const response = await api.get(baseUrl, {
      params: { Page: page, PageSize: pageSize },
    });

    return response.data;
  },

  create: async (data: ProcesoPagoSalarioSaveDTO): Promise<ProcesoPagoSalario> => {
    const response = await api.post(baseUrl, data);

    return response.data;
  },

  getDetalles: async (id: number): Promise<PagoSalarioDetalle[]> => {
    const response = await api.get(`${baseUrl}/${id}/detalles`);

    return response.data;
  },

  generar: async (id: number): Promise<ProcesoPagoSalario> => {
    const response = await api.post(`${baseUrl}/${id}/generar`);

    return response.data;
  },

  addDetalle: async (
    id: number,
    data: PagoSalarioDetalleSaveDTO,
  ): Promise<PagoSalarioDetalle> => {
    const response = await api.post(`${baseUrl}/${id}/detalles`, data);

    return response.data;
  },

  updateDetalle: async (
    id: number,
    idDetalle: number,
    data: PagoSalarioDetalleSaveDTO,
  ): Promise<PagoSalarioDetalle> => {
    const response = await api.put(`${baseUrl}/${id}/detalles/${idDetalle}`, data);

    return response.data;
  },

  deleteDetalle: async (id: number, idDetalle: number): Promise<void> => {
    await api.delete(`${baseUrl}/${id}/detalles/${idDetalle}`);
  },

  verificar: async (id: number): Promise<ProcesoPagoSalario> => {
    const response = await api.post(`${baseUrl}/${id}/verificar`);

    return response.data;
  },

  cerrar: async (
    id: number,
    data: CerrarProcesoPagoSalarioDTO,
  ): Promise<ProcesoPagoSalario> => {
    const response = await api.post(`${baseUrl}/${id}/cerrar`, data);

    return response.data;
  },

  getRecibos: async (
    id: number,
    idEmpleado?: number,
  ): Promise<ReciboPagoSalario[]> => {
    const url = idEmpleado
      ? `${baseUrl}/${id}/empleados/${idEmpleado}/recibo`
      : `${baseUrl}/${id}/recibos`;
    const response = await api.get(url);

    return response.data;
  },
};
