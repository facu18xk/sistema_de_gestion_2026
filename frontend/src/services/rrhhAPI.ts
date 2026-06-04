import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  Cargo,
  CargoSaveDTO,
  CerrarProcesoPagoSalarioDTO,
  ConceptoSalario,
  ConceptoSalarioSaveDTO,
  EmpleadoCargo,
  EmpleadoCargoSaveDTO,
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO,
  PaginatedResponse,
  PagoSalarioDetalle,
  PagoSalarioDetalleSaveDTO,
  ParametroSalario,
  ParametroSalarioSaveDTO,
  ProcesoPagoSalario,
  ProcesoPagoSalarioSaveDTO,
  ReciboSalario,
} from "@/types/types";

type CrudEndpoint<T, TSave> = {
  getAll: (page?: number, pageSize?: number) => Promise<PaginatedResponse<T>>;
  getById: (id: number) => Promise<T>;
  create: (data: TSave) => Promise<T>;
  update: (id: number, data: TSave) => Promise<T>;
  delete: (id: number) => Promise<T>;
};

function createCrudApi<T, TSave>(endpoint: string): CrudEndpoint<T, TSave> {
  return {
    getAll: async (page = 1, pageSize = 300) => {
      const response = await api.get(endpoint, {
        params: { page, pageSize },
      });
      return response.data;
    },

    getById: async (id: number) => {
      const response = await api.get(`${endpoint}/${id}`);
      return response.data;
    },

    create: async (data: TSave) => {
      const response = await api.post(endpoint, data);
      return response.data;
    },

    update: async (id: number, data: TSave) => {
      const response = await api.put(`${endpoint}/${id}`, data);
      return response.data;
    },

    delete: async (id: number) => {
      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    },
  };
}

export function getBusinessErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;

    if (typeof response?.data === "string") return response.data;

    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      return String((response.data as { message?: unknown }).message);
    }
  }

  return "No se pudo procesar la solicitud.";
}

export const cargosAPI = createCrudApi<Cargo, CargoSaveDTO>(
  API_CONFIG.ENDPOINTS.CARGOS,
);

export const empleadosCargosAPI = createCrudApi<
  EmpleadoCargo,
  EmpleadoCargoSaveDTO
>(API_CONFIG.ENDPOINTS.EMPLEADOS_CARGOS);

export const conceptosSalariosAPI = createCrudApi<
  ConceptoSalario,
  ConceptoSalarioSaveDTO
>(API_CONFIG.ENDPOINTS.CONCEPTOS_SALARIOS);

export const parametrosSalariosAPI = createCrudApi<
  ParametroSalario,
  ParametroSalarioSaveDTO
>(API_CONFIG.ENDPOINTS.PARAMETROS_SALARIOS);

export const empleadosConceptosMensualesAPI = createCrudApi<
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO
>(API_CONFIG.ENDPOINTS.EMPLEADOS_CONCEPTOS_MENSUALES);

export const procesosPagosSalariosAPI = {
  ...createCrudApi<ProcesoPagoSalario, ProcesoPagoSalarioSaveDTO>(
    API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS,
  ),

  generar: async (id: number): Promise<ProcesoPagoSalario> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/generar`,
    );
    return response.data;
  },

  getDetalles: async (id: number): Promise<PagoSalarioDetalle[]> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/detalles`,
    );
    return response.data;
  },

  createDetalle: async (
    id: number,
    data: PagoSalarioDetalleSaveDTO,
  ): Promise<PagoSalarioDetalle> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/detalles`,
      data,
    );
    return response.data;
  },

  updateDetalle: async (
    id: number,
    idDetalle: number,
    data: PagoSalarioDetalleSaveDTO,
  ): Promise<PagoSalarioDetalle> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/detalles/${idDetalle}`,
      data,
    );
    return response.data;
  },

  deleteDetalle: async (id: number, idDetalle: number) => {
    const response = await api.delete(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/detalles/${idDetalle}`,
    );
    return response.data;
  },

  verificar: async (id: number): Promise<ProcesoPagoSalario> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/verificar`,
    );
    return response.data;
  },

  cerrar: async (
    id: number,
    data: CerrarProcesoPagoSalarioDTO,
  ): Promise<ProcesoPagoSalario> => {
    const response = await api.post(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/cerrar`,
      data,
    );
    return response.data;
  },

  getRecibos: async (id: number): Promise<ReciboSalario[]> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/recibos`,
    );
    return response.data;
  },

  getReciboEmpleado: async (
    id: number,
    idEmpleado: number,
  ): Promise<ReciboSalario[]> => {
    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROCESOS_PAGOS_SALARIOS}/${id}/empleados/${idEmpleado}/recibo`,
    );
    return response.data;
  },
};
