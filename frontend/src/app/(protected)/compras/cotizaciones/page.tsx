"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Trash2, Loader2, X } from "lucide-react";
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { proveedoresAPI } from "@/services/proveedoresAPI";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { CotizacionDTO, Proveedor } from "@/types/types";
import { notify } from "@/lib/notifications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const formatCotizacionNro = (id: number | string) => {
  return `CP-${String(id).padStart(4, "0")}`;
};

export const formatPedidoNro = (id: number | string) => {
  return `PC-${String(id).padStart(4, "0")}`;
};

export default function CotizacionesPage() {
  const searchParams = useSearchParams();

  const [cotizaciones, setCotizaciones] = useState<CotizacionDTO[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pagina, setPagina] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("filters_cotizaciones");
      if (saved) {
        try { return JSON.parse(saved).pagina || 1; } catch { return 1; }
      }
    }
    return 1;
  });

  const [filters, setFilters] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("filters_cotizaciones");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.filters) return parsed.filters;
        } catch { }
      }
    }
    return {
      proveedor: "",
      pedidoAsociado: "",
      fechaDesde: "",
      fechaHasta: "",
      estado: "",
    };
  });

  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    const urlPedidoId = searchParams.get("idPedidoCompra");
    if (urlPedidoId) {
      setFilters((prev) => ({
        ...prev,
        pedidoAsociado: urlPedidoId,
      }));
      setPagina(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const cargarMaestros = async () => {
      try {
        const res = await proveedoresAPI.getAll(1, 200);
        setProveedores(res.items || res || []);
      } catch (err) {
        console.error("Error cargando proveedores para filtros:", err);
      }
    };
    cargarMaestros();
  }, []);

  // Se eliminó el useEffect reactivo que guardaba en cada render
  // Ahora guardamos selectivamente cuando cambia de página o filtros de forma explícita
  useEffect(() => {
    const stateToSave = { filters, pagina };
    sessionStorage.setItem("filters_cotizaciones", JSON.stringify(stateToSave));
  }, [filters, pagina]);

  const cargarPagina = async (numPagina: number) => {
    setIsLoading(true);
    try {
      const res = await cotizacionesAPI.getAll(numPagina, 10);
      let registros = res.items || res || [];

      if (filters.proveedor) {
        registros = registros.filter(
          (c: any) => String(c.idProveedor) === filters.proveedor
        );
      }
      if (filters.pedidoAsociado) {
        registros = registros.filter((c: any) =>
          c.idPedidoCompra && String(c.idPedidoCompra).includes(filters.pedidoAsociado)
        );
      }
      if (filters.estado) {
        registros = registros.filter(
          (c: any) =>
            c.estado?.toLowerCase() === filters.estado.toLowerCase() ||
            String(c.idEstado) === filters.estado
        );
      }
      if (filters.fechaDesde) {
        registros = registros.filter((c: any) => c.fecha && c.fecha >= filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        registros = registros.filter((c: any) => c.fecha && c.fecha <= filters.fechaHasta);
      }

      setCotizaciones(registros);
      setTotalPaginas(res.totalPages || 1);
    } catch (error) {
      console.error("Error al recuperar cotizaciones:", error);
      notify.error("Error de carga", "No se pudo recuperar la lista del servidor.");
      setCotizaciones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina(pagina);
  }, [pagina, filters]);

  const handleFilterChange = (id: string, value: string) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
    setPagina(1);
  };

  const handleLimpiarFiltros = () => {
    setFilters({
      proveedor: "",
      pedidoAsociado: "",
      fechaDesde: "",
      fechaHasta: "",
      estado: "",
    });
    setPagina(1);
    sessionStorage.removeItem("filters_cotizaciones");
    if (searchParams.get("idPedidoCompra")) {
      window.history.replaceState(null, "", "/compras/cotizaciones");
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm(`¿Está seguro de eliminar de forma permanente la cotización ${formatCotizacionNro(id)}?`)) {
      return;
    }
    try {
      await cotizacionesAPI.delete(id);
      notify.success("Eliminado", "La cotización fue removida exitosamente.");
      cargarPagina(pagina);
    } catch (error) {
      console.error("Error al eliminar cotización:", error);
      notify.error("Error", "No se pudo eliminar el registro por dependencias de integridad referencial.");
    }
  };

  const filterFields: FilterField[] = [
    {
      id: "proveedor",
      label: "Proveedor",
      type: "select",
      placeholder: "Todos los proveedores",
      options: proveedores.map((p) => ({
        label: p.razonSocial,
        value: String(p.idProveedor),
      })),
    },
    {
      id: "pedidoAsociado",
      label: "Nro Pedido",
      type: "text",
      placeholder: "Buscar por pedido ID..."
    },
    { id: "fechaDesde", label: "Desde", type: "date" },
    { id: "fechaHasta", label: "Hasta", type: "date" },
    {
      id: "estado",
      label: "Estado",
      type: "select",
      placeholder: "Todos los estados",
      options: [
        { label: "Pendiente", value: "Pendiente" },
        { label: "Aprobado", value: "Aprobado" },
        { label: "Rechazado", value: "Rechazado" },
        { label: "Con Orden de Compra", value: "Procesado" },
      ],
    },
  ];

  const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

  return (
    <div className="bg-background">
      <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Cotizaciones" }]} />

      <main className="container p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold tracking-tight">Listado de Cotizaciones</h2>
          <Link href="/compras/cotizaciones/nuevo">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        <div className="relative w-full mb-4">
          <FilterBar
            fields={filterFields}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {tieneFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLimpiarFiltros}
              className="absolute right-3 -top-3.5 h-6 text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 bg-background border px-2 rounded-full shadow-xs z-10"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Filtrando y mapeando registros del servidor...
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-32">Nro Cotización</TableHead>
                  <TableHead className="w-32">Pedido Asociado</TableHead>
                  <TableHead className="w-48">Proveedor</TableHead>
                  <TableHead className="w-36">Fecha</TableHead>
                  <TableHead className="w-32">Estado / Control</TableHead>
                  <TableHead className="w-28 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      No se encontraron cotizaciones con los criterios seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  /* CORREGIDO AQUÍ: Evaluando expresión limpia */
                  cotizaciones.map((c) => {
                    const tieneOrden = c.idEstado === 3 || c.estado === "Procesado" || (c as any).tieneOrdenAsociada;

                    return (
                      <TableRow key={c.idPedidoCotizacion} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {formatCotizacionNro(c.idPedidoCotizacion)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {c.idPedidoCompra ? (
                            <span className="text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                              {formatPedidoNro(c.idPedidoCompra)}
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {c.proveedor?.razonSocial || "Proveedor no asignado"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.fecha ? c.fecha.substring(0, 10) : "—"}
                        </TableCell>
                        <TableCell className="text-xs flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                            {c.estado || `Estado ${c.idEstado}`}
                          </span>
                          {tieneOrden && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-extrabold px-1.5 rounded uppercase tracking-tight">
                              ✓ Orden Emitida
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Link href={`/compras/cotizaciones/${c.idPedidoCotizacion}/editar?view=true`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Inspeccionar">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Link href={`/compras/cotizaciones/${c.idPedidoCotizacion}/editar`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Editar">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleEliminar(c.idPedidoCotizacion)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-3 bg-muted/20 border-t text-xs">
              <span className="text-muted-foreground">
                Página <b>{pagina}</b> de {totalPaginas}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPagina((prev: any) => Math.max(prev - 1, 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPagina((prev: any) => Math.min(prev + 1, totalPaginas))}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}