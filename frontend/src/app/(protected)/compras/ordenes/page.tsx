"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Eye, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FilterBar, FilterField } from "@/components/shared/filter-bar"
import { useRouter } from "next/navigation"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { OrdenCompraDTO, Proveedor } from "@/types/types"
import { notify } from "@/lib/notifications"

export default function OrdenesPage() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [allOrdenes, setAllOrdenes] = useState<OrdenCompraDTO[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>()
    const [ordenAEliminar, setOrdenAEliminar] = useState<OrdenCompraDTO | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [filters, setFilters] = useState<Record<string, string>>({
        proveedor: "",
        estado: "",
        fechaDesde: "",
        fechaHasta: ""
    })

    useEffect(() => {
        const savedFilters = sessionStorage.getItem("filters_ordenes");
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                if (parsed.filters) setFilters(parsed.filters);
                if (parsed.pagina) setCurrentPage(parsed.pagina);
            } catch (e) {
                console.error("Error recuperando filtros de órdenes", e);
            }
        }
    }, []);

    const guardarSnapshotFiltros = () => {
        const stateToSave = { filters, pagina: currentPage };
        sessionStorage.setItem("filters_ordenes", JSON.stringify(stateToSave));
    }

    const camposFiltro: FilterField[] = [
        {
            id: "proveedor",
            label: "Proveedor",
            type: "select",
            placeholder: "Todos los proveedores (Nombre o RUC)",
            options: proveedores?.map((p) => ({
                label: `${p.razonSocial} (${p.ruc})`,
                value: String(p.idProveedor),
            })) || [],
        },
        {
            id: "estado",
            label: "Estado",
            type: "select",
            placeholder: "Todos los estados",
            options: [
                { value: "Pendiente", label: "Pendiente" },
                { value: "Emitido", label: "Emitido" },
                { value: "Completado", label: "Completado" },
                { value: "Anulado", label: "Anulado" }
            ]
        },
        { id: "fechaDesde", label: "Fecha Desde", type: "date" },
        { id: "fechaHasta", label: "Fecha Hasta", type: "date" }
    ]

    const formatearNumeroOrden = (numero: number | string) => {
        return `OC-${String(numero).padStart(4, "0")}`
    }

    const formatearNumeroCotizacion = (numero: number | string) => {
        return `CP-${String(numero).padStart(4, "0")}`
    }

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }))
        setCurrentPage(1)
    }

    const handleLimpiarFiltros = () => {
        setFilters({ proveedor: "", estado: "", fechaDesde: "", fechaHasta: "" });
        setCurrentPage(1);
        sessionStorage.removeItem("filters_ordenes");
    };

    const getEstadoStyle = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
            case 'emitido': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400';
            case 'completado': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
            case 'anulado': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const cargarDatosPagina = async () => {
        setIsLoading(true)
        try {
            const obtenerTodoRecursivo = async (p: number, acumulado: OrdenCompraDTO[]): Promise<OrdenCompraDTO[]> => {
                const res = await ordenesCompraAPI.getAll(p, 50);
                const items = res.items || res || [];
                const total = [...acumulado, ...items];

                if (!res.totalPages || p >= res.totalPages || items.length === 0) {
                    return total;
                }
                return obtenerTodoRecursivo(p + 1, total);
            };

            const [itemsOrdenes, resProveedores] = await Promise.all([
                obtenerTodoRecursivo(1, []),
                proveedoresAPI.getAll(1, 300)
            ])

            setAllOrdenes(itemsOrdenes)
            setProveedores(resProveedores.items || resProveedores || [])
        } catch (error) {
            console.error("Error al sincronizar datos de órdenes:", error)
            notify.error("Error de conexión", "No se pudieron recuperar los registros del servidor.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        cargarDatosPagina()
    }, [])

    const ordenesFiltradas = useMemo(() => {
        return allOrdenes.filter((o) => {
            const cumpleProveedor = filters.proveedor ? String(o.idProveedor) === filters.proveedor : true
            const cumpleEstado = filters.estado ? o.estado?.toLowerCase() === filters.estado.toLowerCase() : true

            const fechaOrden = o.fecha ? o.fecha.substring(0, 10) : ""
            const cumpleDesde = filters.fechaDesde ? fechaOrden >= filters.fechaDesde : true
            const cumpleHasta = filters.fechaHasta ? fechaOrden <= filters.fechaHasta : true

            return cumpleProveedor && cumpleEstado && cumpleDesde && cumpleHasta
        })
    }, [allOrdenes, filters])

    const totalPages = useMemo(() => {
        const pages = Math.ceil(ordenesFiltradas.length / itemsPerPage)
        return pages > 0 ? pages : 1
    }, [ordenesFiltradas, itemsPerPage])

    const ordenesPaginadas = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return ordenesFiltradas.slice(startIndex, endIndex)
    }, [ordenesFiltradas, currentPage, itemsPerPage])

    const handleCrearNuevo = () => {
        guardarSnapshotFiltros()
        router.push("/compras/ordenes/generar")
    }

    const handleEditar = (o: OrdenCompraDTO) => {
        guardarSnapshotFiltros()
        router.push(`/compras/ordenes/${o.idOrdenCompra}/editar`)
    }

    const handleVerDetalle = (o: OrdenCompraDTO) => {
        guardarSnapshotFiltros()
        router.push(`/compras/ordenes/${o.idOrdenCompra}/editar?readOnly=true`)
    }

    const handleVerFacturasAsociadas = (o: OrdenCompraDTO) => {
        guardarSnapshotFiltros()
        router.push(`/compras/facturas?idOrdenCompra=${o.idOrdenCompra}`)
    }

    const confirmarEliminacion = async () => {
        if (ordenAEliminar) {
            try {
                await ordenesCompraAPI.delete(ordenAEliminar.idOrdenCompra)
                notify.success("Eliminado", "La orden de compra fue removida exitosamente.")
                await cargarDatosPagina()
            } catch (error) {
                console.error(error)
                notify.error("Error de integridad", "No se puede eliminar la orden por dependencias jerárquicas.")
            } finally {
                setIsAlertOpen(false)
                setOrdenAEliminar(null)
            }
        }
    }

    const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

    return (
        <>
            <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Órdenes de Compra" }]} />

            <PageHeader
                title="Listado de Órdenes de Compra"
                buttonLabel="Nueva Orden"
                onButtonClick={handleCrearNuevo}
            />

            <div className="relative w-full mb-2">
                <FilterBar fields={camposFiltro} filters={filters} onFilterChange={handleFilterChange} />
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
                            Esta acción revocará la orden de compra de forma permanente en el servidor.
                            No podrá deshacer los cambios sobre el registro{" "}
                            <span className="font-bold text-foreground">
                                "{ordenAEliminar ? formatearNumeroOrden(ordenAEliminar.idOrdenCompra) : ""}"
                            </span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmarEliminacion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar Registro
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
                <div className="flex justify-center p-6">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            ) : (
                <DataTable
                    caption="Historial analítico de órdenes de compra emitidas."
                    headerRow={
                        <TableRow>
                            <TableHead className="w-32">Nro Orden</TableHead>
                            <TableHead className="w-32">Cotización</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="w-36">Fecha</TableHead>
                            <TableHead className="w-36">Estado</TableHead>
                            <TableHead className="text-right w-36">Acciones</TableHead>
                        </TableRow>
                    }
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                >
                    {ordenesPaginadas.map((o) => {
                        const esModificable = o.estado === "Pendiente"
                        const permiteFacturas = o.estado === "Emitido" || o.estado === "Completado"

                        return (
                            <TableRow key={o.idOrdenCompra} className="hover:bg-muted/40 transition-colors">
                                <TableCell className="font-mono text-xs font-bold text-primary">
                                    {formatearNumeroOrden(o.idOrdenCompra)}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                    {o.idPedidoCotizacion ? (
                                        <span className="text-muted-foreground font-medium bg-muted px-1.5 rounded">
                                            {formatearNumeroCotizacion(o.idPedidoCotizacion)}
                                        </span>
                                    ) : "Directa / Sin Cotización"}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                    {o.proveedor || "No asignado"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {o.fecha ? o.fecha.substring(0, 10) : "—"}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 rounded-full text-xs font-bold border uppercase tracking-wide text-[10px] ${getEstadoStyle(o.estado)}`}>
                                        {o.estado || "Desconocido"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    {permiteFacturas && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleVerFacturasAsociadas(o)}
                                            className="cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            title="Ver Facturas del Proveedor"
                                        >
                                            <FileText className="size-3.5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => handleVerDetalle(o)} className="cursor-pointer" title="Inspeccionar">
                                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    {esModificable && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditar(o)} className="cursor-pointer" title="Editar">
                                                <Pencil className="size-3.5 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setOrdenAEliminar(o)
                                                    setIsAlertOpen(true)
                                                }}
                                                className="cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </DataTable>
            )}
        </>
    )
}