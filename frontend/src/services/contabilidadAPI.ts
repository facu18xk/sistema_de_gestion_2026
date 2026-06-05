import api from "./api";
import { API_CONFIG } from "@/config/api";
import {
  AsientoCompletoDTO,
  AsientoCompletoPayloadDTO,
  AsientoDetalleDTO,
  AsientoDTO,
  BalanceGeneralReporteDTO,
  BalanceResultadosReporteDTO,
  BalanceSumasYSaldosReporteDTO,
  CuentaContableDTO,
  LibroDiarioReporteDTO,
  LibroMayorReporteDTO,
  PaginatedResponse,
  PeriodoContableDTO,
  ProcesoContableDTO,
} from "@/types/types";

type MaybePaginated<T> = PaginatedResponse<T> | T[];

function normalizePaginated<T>(
  data: MaybePaginated<T>,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return {
      items: data,
      page,
      pageSize,
      totalCount: data.length,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  return data;
}

function paginatedParams(page: number, pageSize: number) {
  return { Page: page, PageSize: pageSize };
}

export const procesosContablesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 100,
  ): Promise<PaginatedResponse<ProcesoContableDTO>> => {
    const response = await api.get<MaybePaginated<ProcesoContableDTO>>(
      API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES,
      { params: paginatedParams(page, pageSize) },
    );
    return normalizePaginated(response.data, page, pageSize);
  },

  create: async (
    data: Omit<ProcesoContableDTO, "idProcesoContable">,
  ): Promise<ProcesoContableDTO> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES,
      data,
    );
    return response.data;
  },

  generarPeriodos: async (id: number): Promise<void> => {
    await api.post(
      `${API_CONFIG.ENDPOINTS.PROCESOS_CONTABLES}/${id}/generar-periodos`,
    );
  },
};

export const periodosContablesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 100,
  ): Promise<PaginatedResponse<PeriodoContableDTO>> => {
    const response = await api.get<MaybePaginated<PeriodoContableDTO>>(
      API_CONFIG.ENDPOINTS.PERIODOS_CONTABLES,
      { params: paginatedParams(page, pageSize) },
    );
    return normalizePaginated(response.data, page, pageSize);
  },
};

export const cuentasContablesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 100,
    idProcesoContable?: number,
  ): Promise<PaginatedResponse<CuentaContableDTO>> => {
    const requestPage = idProcesoContable ? 1 : page;
    const requestPageSize = idProcesoContable ? 1000 : pageSize;
    const response = await api.get<MaybePaginated<CuentaContableDTO>>(
      API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES,
      {
        params: paginatedParams(requestPage, requestPageSize),
      },
    );

    const normalized = normalizePaginated(
      response.data,
      requestPage,
      requestPageSize,
    );
    if (!idProcesoContable) return normalized;

    const filteredItems = normalized.items.filter(
      (cuenta) => cuenta.idProcesoContable === idProcesoContable,
    );
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const start = (page - 1) * pageSize;

    return {
      items: filteredItems.slice(start, start + pageSize),
      page,
      pageSize,
      totalCount: filteredItems.length,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  },

  create: async (
    data: Omit<CuentaContableDTO, "idCuentaContable" | "cuentaPadre">,
  ): Promise<CuentaContableDTO> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES,
      data,
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Omit<CuentaContableDTO, "idCuentaContable" | "cuentaPadre">,
  ): Promise<CuentaContableDTO> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.CUENTAS_CONTABLES}/${id}`);
  },
};

export const asientosAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<AsientoDTO>> => {
    const response = await api.get<MaybePaginated<AsientoDTO>>(
      API_CONFIG.ENDPOINTS.ASIENTOS,
      { params: paginatedParams(page, pageSize) },
    );
    return normalizePaginated(response.data, page, pageSize);
  },

  createCompleto: async (
    data: AsientoCompletoPayloadDTO,
  ): Promise<AsientoCompletoDTO> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.ASIENTOS_COMPLETO,
      data,
    );
    return response.data;
  },

  getById: async (id: number): Promise<AsientoDTO> => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.ASIENTOS}/${id}`);
    return response.data;
  },

  updateCompleto: async (
    id: number,
    data: AsientoCompletoPayloadDTO,
  ): Promise<AsientoCompletoDTO> => {
    const response = await api.put(
      `${API_CONFIG.ENDPOINTS.ASIENTOS_COMPLETO}/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${API_CONFIG.ENDPOINTS.ASIENTOS}/${id}`);
  },
};

export const asientosDetallesAPI = {
  getAll: async (
    page: number = 1,
    pageSize: number = 100,
  ): Promise<PaginatedResponse<AsientoDetalleDTO>> => {
    const response = await api.get<MaybePaginated<AsientoDetalleDTO>>(
      API_CONFIG.ENDPOINTS.ASIENTOS_DETALLES,
      { params: paginatedParams(page, pageSize) },
    );
    return normalizePaginated(response.data, page, pageSize);
  },
};

export const reportesContablesAPI = {
  getLibroDiario: async (
    idPeriodoContable: number,
  ): Promise<LibroDiarioReporteDTO> => {
    const response = await api.get<LibroDiarioReporteDTO>(
      `${API_CONFIG.ENDPOINTS.REPORTES_CONTABLES}/libro-diario/${idPeriodoContable}`,
    );
    return response.data;
  },

  getLibroMayor: async (
    idPeriodoContable: number,
  ): Promise<LibroMayorReporteDTO> => {
    const response = await api.get<LibroMayorReporteDTO>(
      `${API_CONFIG.ENDPOINTS.REPORTES_CONTABLES}/libro-mayor/${idPeriodoContable}`,
    );
    return response.data;
  },

  getBalanceSumasYSaldos: async (
    idPeriodoContable: number,
  ): Promise<BalanceSumasYSaldosReporteDTO> => {
    const response = await api.get<BalanceSumasYSaldosReporteDTO>(
      `${API_CONFIG.ENDPOINTS.REPORTES_CONTABLES}/balance-sumas-saldos/${idPeriodoContable}`,
    );
    return response.data;
  },

  getBalanceGeneral: async (
    idPeriodoContable: number,
  ): Promise<BalanceGeneralReporteDTO> => {
    const response = await api.get<BalanceGeneralReporteDTO>(
      `${API_CONFIG.ENDPOINTS.REPORTES_CONTABLES}/balance-general/${idPeriodoContable}`,
    );
    return response.data;
  },

  getBalanceResultados: async (
    idPeriodoContable: number,
  ): Promise<BalanceResultadosReporteDTO> => {
    const response = await api.get<BalanceResultadosReporteDTO>(
      `${API_CONFIG.ENDPOINTS.REPORTES_CONTABLES}/balance-resultados/${idPeriodoContable}`,
    );
    return response.data;
  },
};
