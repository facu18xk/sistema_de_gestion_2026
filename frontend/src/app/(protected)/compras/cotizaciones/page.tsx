"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2, Loader2, X, FileText } from "lucide-react";
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { proveedoresAPI } from "@/services/proveedoresAPI";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { CotizacionDTO, Proveedor } from "@/types/types";
import { notify } from "@/lib/notifications";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando cotizaciones...</div>}>
      <CotizacionesPageContent />
    </Suspense>
  );
}

function CotizacionesPageContent() {
  const searchParams = useSearchParams();

  const [cotizaciones, setCotizaciones] = useState<CotizacionDTO[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<CotizacionDTO | null>(null);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>("");
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    const stateToSave = { filters, pagina };
    sessionStorage.setItem("filters_cotizaciones", JSON.stringify(stateToSave));
  }, [filters, pagina]);

  const cargarPagina = async (numPagina: number) => {
    setIsLoading(true);
    try {
      const obtenerTodoRecursivo = async (p: number, acumulado: any[]): Promise<any[]> => {
        const res = await cotizacionesAPI.getAll(p, 50);
        const items = res.items || res || [];
        const total = [...acumulado, ...items];

        if (!res.totalPages || p >= res.totalPages || items.length === 0) {
          return total;
        }
        return obtenerTodoRecursivo(p + 1, total);
      };

      let registros = await obtenerTodoRecursivo(1, []);

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
        registros = registros.filter((c: any) => {
          const idStr = String(c.idEstado || "").trim();
          const estLower = String(c.estado || "").toLowerCase().trim();

          if (filters.estado === "1") {
            return idStr === "1" || estLower.includes("pend");
          }
          if (filters.estado === "2") {
            return idStr === "2" || estLower.includes("aprob") || estLower.includes("proces");
          }
          if (filters.estado === "8") {
            return idStr === "8" || estLower.includes("anul");
          }

          return idStr === filters.estado || estLower === filters.estado.toLowerCase();
        });
      }

      if (filters.fechaDesde) {
        registros = registros.filter((c: any) => c.fecha && c.fecha >= filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        registros = registros.filter((c: any) => c.fecha && c.fecha <= filters.fechaHasta);
      }

      const calculadoTotalPaginas = Math.ceil(registros.length / 10) || 1;
      setTotalPaginas(calculadoTotalPaginas);

      const indiceInicial = (numPagina - 1) * 10;
      const indiceFinal = indiceInicial + 10;

      setCotizaciones(registros.slice(indiceInicial, indiceFinal));
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

  const handleEliminar = async () => {
    if (cotizacionAEliminar) {
      try {
        await cotizacionesAPI.delete(cotizacionAEliminar.idPedidoCotizacion)
        notify.success("Eliminado", "La cotización fue removida exitosamente.")
        await cargarPagina(1)
      } catch (error) {
        console.error(error)
        notify.error("Error de integridad", "No se puede eliminar la cotización por dependencias jerárquicas.")
      } finally {
        setIsAlertOpen(false)
        setCotizacionAEliminar(null)
      }
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
        { label: "Pendiente", value: "1" },
        { label: "Aprobado", value: "2" },
        { label: "Anulado", value: "8" },
      ],
    },
  ];

  const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

  // Colores corregidos y adaptados
  const getEstadoBadgeStyle = (estado?: string, idEstado?: number) => {
    const est = estado?.toLowerCase() || "";
    const idStr = String(idEstado || "");

    // 1: Pendiente (Amarillo / Ámbar)
    if (idStr === "1" || est.includes("pend")) {
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
    }
    // 2: Aprobado / Procesado (Verde)
    if (idStr === "2" || est.includes("aprob") || est.includes("proces")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50";
    }
    // 8: Anulado (Rojo)
    if (idStr === "8" || est.includes("anul")) {
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50";
    }

    return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
  };

  const getEstadoStyle = (estado?: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'aprobado':
      case 'completado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelado': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  const getEstadoLiteral = (estado?: string, idEstado?: number) => {
    if (estado) return estado;
    if (idEstado === 1) return "Pendiente";
    if (idEstado === 2) return "Aprobado";
    if (idEstado === 8) return "Anulado";
    return `Estado ${idEstado}`;
  };

  return (
    <div className="bg-background">
      <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Cotizaciones" }]} />

      <main className="container">
        <div className="flex justify-between items-center mb-2 mt-1">
          <h5 className="font-bold tracking-tight">Listado de Cotizaciones</h5>
          <Link href="/compras/cotizaciones/nuevo">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        <div className="relative w-full mb-3">
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
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está completamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará la orden de compra <span className="font-bold text-foreground">
                  "{cotizacionAEliminar ? formatCotizacionNro(cotizacionAEliminar.idPedidoCotizacion) : ""}"
                </span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleEliminar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar Registro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                  cotizaciones.map((c) => {
                    const idEstadoNum = Number(c.idEstado);
                    const tieneOrden = c.estado?.toLowerCase().includes("proces") || !!(c as any).tieneOrdenAsociada;

                    const esModificable = idEstadoNum === 1 || c.estado?.toLowerCase().includes("pend");
                    const mostrarBotonOrden = idEstadoNum === 2 || c.estado?.toLowerCase().includes("aprob") || tieneOrden;

                    return (
                      <TableRow key={c.idPedidoCotizacion} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="font-mono text-xs text-primary">
                          {formatCotizacionNro(c.idPedidoCotizacion)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {c.idPedidoCompra ? (
                            <Link href={`/compras/pedidos/${c.idPedidoCompra}/editar?view=true`}>
                              <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline bg-blue-50/50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-left cursor-pointer">
                                {formatPedidoNro(c.idPedidoCompra)}
                              </span>
                            </Link>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {c.proveedor?.razonSocial || "Proveedor no asignado"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.fecha ? c.fecha.substring(0, 10) : "—"}
                        </TableCell>
                        <TableCell className="text-xs flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getEstadoStyle(c.estado)}`}>
                            {getEstadoLiteral(c.estado, c.idEstado)}
                          </span>
                          {tieneOrden && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 font-extrabold px-1.5 rounded border border-emerald-200 dark:border-emerald-900/30 uppercase tracking-tight">
                              ✓ Orden Emitida
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-end gap-1">
                            {mostrarBotonOrden && (
                              <Link href={`/compras/ordenes?idPedidoCotizacion=${c.idPedidoCotizacion}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                  title="Ver Órdenes Generadas"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            )}

                            {/* El Ojito pasa correctamente ?view=true */}
                            <Link href={`/compras/cotizaciones/${c.idPedidoCotizacion}/editar?view=true`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Inspeccionar">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>

                            {esModificable && (
                              <>
                                <Link href={`/compras/cotizaciones/${c.idPedidoCotizacion}/editar`}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Editar">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    setCotizacionAEliminar(c)
                                    setIsAlertOpen(true)
                                  }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
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
