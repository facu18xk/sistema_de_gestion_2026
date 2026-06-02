"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2, Loader2, X, FileCheck, FileText } from "lucide-react";
import { ordenesPagosAPI } from "@/services/ordenesPagosCompraAPI";
import { proveedoresAPI } from "@/services/proveedoresAPI";
import { FilterBar, FilterField } from "@/components/shared/filter-bar";
import { OrdenPagoCompra, Proveedor } from "@/types/types";
import { notify } from "@/lib/notifications";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Formateador solicitado para Órdenes de Pago (PP-000X)
export const formatPagoNro = (id: number | string) => {
    return `PP-${String(id).padStart(4, "0")}`;
};

export default function OrdenesPagosPage() {
    const searchParams = useSearchParams();

    const [ordenesPago, setOrdenesPago] = useState<OrdenPagoCompra[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPaginas, setTotalPaginas] = useState(1);

    // Recuperar página inicial desde sessionStorage
    const [pagina, setPagina] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("filters_ordenes_pago");
            if (saved) {
                try { return JSON.parse(saved).pagina || 1; } catch { return 1; }
            }
        }
        return 1;
    });

    // Estado de Filtros consistentes
    const [filters, setFilters] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("filters_ordenes_pago");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.filters) return parsed.filters;
                } catch { }
            }
        }
        return {
            proveedor: "",
            fechaDesde: "",
            fechaHasta: "",
            estado: "",
        };
    });

    // Carga de proveedores para el selector del filtro
    useEffect(() => {
        const cargarProveedores = async () => {
            try {
                const res = await proveedoresAPI.getAll(1, 200);
                setProveedores(res.items || res || []);
            } catch (err) {
                console.error("Error cargando proveedores para filtros de pagos:", err);
            }
        };
        cargarProveedores();
    }, []);

    // Guardar estado de filtros en sessionStorage para no perder posición
    useEffect(() => {
        const stateToSave = { filters, pagina };
        sessionStorage.setItem("filters_ordenes_pago", JSON.stringify(stateToSave));
    }, [filters, pagina]);

    // Carga recursiva y filtrado en cliente idéntico al de Cotizaciones
    const cargarPagina = async (numPagina: number) => {
        setIsLoading(true);
        try {
            const obtenerTodoRecursivo = async (p: number, acumulado: any[]): Promise<any[]> => {
                const res = await ordenesPagosAPI.getAll(p, 50);
                const items = res.items || res || [];
                const total = [...acumulado, ...items];

                if (!res.totalPages || p >= res.totalPages || items.length === 0) {
                    return total;
                }
                return obtenerTodoRecursivo(p + 1, total);
            };

            let registros = await obtenerTodoRecursivo(1, []);

            // 1. Filtrar por Proveedor
            if (filters.proveedor) {
                registros = registros.filter(
                    (op: any) => String(op.idProveedor) === filters.proveedor
                );
            }

            // 2. Filtrar por Estado
            if (filters.estado) {
                registros = registros.filter((op: any) => {
                    const idStr = String(op.idEstado || "").trim();
                    const estLower = String(op.estado || "").toLowerCase().trim();

                    if (filters.estado === "1") return idStr === "1" || estLower.includes("pend");
                    if (filters.estado === "2") return idStr === "2" || estLower.includes("proces") || estLower.includes("pag");
                    if (filters.estado === "8") return idStr === "8" || estLower.includes("anul");

                    return idStr === filters.estado || estLower === filters.estado.toLowerCase();
                });
            }

            // 3. Filtrar por rango de Fechas (Desde - Hasta)
            if (filters.fechaDesde) {
                registros = registros.filter((op: any) => op.fecha && op.fecha >= filters.fechaDesde);
            }
            if (filters.fechaHasta) {
                registros = registros.filter((op: any) => op.fecha && op.fecha <= filters.fechaHasta);
            }

            // Calcular paginación basada en registros filtrados
            const calculadoTotalPaginas = Math.ceil(registros.length / 10) || 1;
            setTotalPaginas(calculadoTotalPaginas);

            const indiceInicial = (numPagina - 1) * 10;
            const indiceFinal = indiceInicial + 10;

            setOrdenesPago(registros.slice(indiceInicial, indiceFinal));
        } catch (error) {
            console.error("Error al recuperar órdenes de pago:", error);
            notify.error("Error de carga", "No se pudo recuperar la lista de órdenes de pago.");
            setOrdenesPago([]);
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
            fechaDesde: "",
            fechaHasta: "",
            estado: "",
        });
        setPagina(1);
        sessionStorage.removeItem("filters_ordenes_pago");
    };

    const handleEliminar = async (id: number) => {
        if (!window.confirm(`¿Está seguro de anular/eliminar permanentemente la orden de pago ${formatPagoNro(id)}?`)) {
            return;
        }
        try {
            await ordenesPagosAPI.delete(id);
            notify.success("Eliminado", "La orden de pago fue removida exitosamente.");
            cargarPagina(pagina);
        } catch (error) {
            console.error("Error al eliminar orden de pago:", error);
            notify.error("Error", "No se pudo eliminar el registro debido a dependencias en el servidor.");
        }
    };

    // Función de cálculo corregida: Se asegura de barrer detalles o detallesFacturas
    const calcularTotalOrdenPago = (op: any): number => {
        const listaDetalles = op.detalles || op.detallesFacturas || [];
        if (!listaDetalles || !Array.isArray(listaDetalles)) return 0;
        return listaDetalles.reduce((acc, det) => acc + (det.monto || det.montoPagado || det.subtotal || 0), 0);
    };

    // Definición de campos para el componente FilterBar
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
        { id: "fechaDesde", label: "Desde", type: "date" },
        { id: "fechaHasta", label: "Hasta", type: "date" },
        {
            id: "estado",
            label: "Estado",
            type: "select",
            placeholder: "Todos los estados",
            options: [
                { label: "Pendiente", value: "1" },
                { label: "Procesado / Pagado", value: "2" },
                { label: "Anulado", value: "8" },
            ],
        },
    ];

    const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

    // Estilos de insignias alineados con el diseño general
    const getEstadoBadgeStyle = (estado: string, idEstado?: number) => {
        const est = estado?.toLowerCase() || "";
        const idStr = String(idEstado || "");

        if (idStr === "1" || est.includes("pend")) {
            return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
        }
        if (idStr === "2" || est.includes("proces") || est.includes("pag") || est.includes("aprob")) {
            return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50";
        }
        if (idStr === "8" || est.includes("anul")) {
            return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50";
        }
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    };

    return (
        <div className="bg-background">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Órdenes de Pago" }]} />

            <main className="container p-3">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold tracking-tight">Órdenes de Pago a Proveedores</h2>
                    <Link href="/compras/pagos/pagar">
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Orden de Pago
                        </Button>
                    </Link>
                </div>

                {/* Barra de Filtros Inyectada */}
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

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground animate-pulse">
                            Filtrando y procesando órdenes de pago...
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    {/* Columnas reordenadas según tu especificación */}
                                    <TableHead className="w-32">Fecha</TableHead>
                                    <TableHead className="w-32">Nro Pago</TableHead>
                                    <TableHead className="w-48">Proveedor</TableHead>
                                    <TableHead className="w-32">Estado</TableHead>
                                    <TableHead className="w-36 text-right">Total Pagado</TableHead>
                                    <TableHead className="w-28 text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordenesPago.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                                            No se encontraron órdenes de pago con los criterios seleccionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ordenesPago.map((op) => {
                                        const idEstadoNum = Number(op.idEstado);
                                        const esModificable = idEstadoNum === 1 || op.estado?.toLowerCase().includes("pend");

                                        return (
                                            <TableRow key={op.idOrdenPagoCompra} className="hover:bg-muted/40 transition-colors">
                                                {/* 1. Fecha */}
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {op.fecha ? op.fecha.substring(0, 10) : "—"}
                                                </TableCell>

                                                {/* 2. Nro Pago (PP-000X) */}
                                                <TableCell className="font-mono text-xs font-bold text-primary">
                                                    {formatPagoNro(op.idOrdenPagoCompra)}
                                                </TableCell>

                                                {/* 3. Proveedor */}
                                                <TableCell className="text-xs font-medium">
                                                    {op.proveedor || `Proveedor #${op.idProveedor}`}
                                                </TableCell>

                                                {/* 4. Estado */}
                                                <TableCell className="text-xs">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getEstadoBadgeStyle(op.estado, op.idEstado)}`}>
                                                        {op.estado || (idEstadoNum === 1 ? "Pendiente" : "Procesado")}
                                                    </span>
                                                </TableCell>

                                                {/* 5. Total Pagado */}
                                                <TableCell className="text-xs text-right font-bold text-foreground">
                                                    {calcularTotalOrdenPago(op).toLocaleString("es-PY")} Gs.
                                                </TableCell>

                                                {/* 6. Acciones */}
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center gap-1">
                                                        {/* Inspeccionar Orden */}
                                                        <Link href={`/compras/pagos/${op.idOrdenPagoCompra}?view=true`}>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Inspeccionar">
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>

                                                        {/* Editar Orden (si está pendiente) */}
                                                        {esModificable && (
                                                            <>
                                                                <Link href={`/compras/pagos/${op.idOrdenPagoCompra}/editar`}>
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Editar">
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </Link>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => handleEliminar(op.idOrdenPagoCompra)}
                                                                    title="Anular/Eliminar"
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

                        {/* Paginador consistente con estados deshabilitados */}
                        <div className="flex items-center justify-between p-3 bg-muted/20 border-t text-xs">
                            <span className="text-muted-foreground">
                                Página <b>{pagina}</b> de {totalPaginas}
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                                    disabled={pagina === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
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