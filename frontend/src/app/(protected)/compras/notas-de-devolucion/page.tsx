"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Eye, X, CheckCircle, Ban } from "lucide-react"
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
import { notasDevolucionesCompraAPI } from "@/services/notasDevolucionesCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { NotaDevolucionCompraDTO, Proveedor } from "@/types/types"
import { notify } from "@/lib/notifications"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"

export default function NotasDevolucionPage() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [allNotas, setAllNotas] = useState<NotaDevolucionCompraDTO[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>()
    const [notaAEliminar, setNotaAEliminar] = useState<NotaDevolucionCompraDTO | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [filters, setFilters] = useState<Record<string, string>>({
        proveedor: "",
        estado: "",
        fechaDesde: "",
        fechaHasta: ""
    })

    useEffect(() => {
        const savedFilters = sessionStorage.getItem("filters_notas_dev");
        if (savedFilters) {
            try {
                const parsed = JSON.parse(savedFilters);
                if (parsed.filters) setFilters(parsed.filters);
                if (parsed.pagina) setCurrentPage(parsed.pagina);
            } catch (e) {
                console.error("Error recuperando filtros", e);
            }
        }
    }, []);

    const guardarSnapshotFiltros = () => {
        const stateToSave = { filters, pagina: currentPage };
        sessionStorage.setItem("filters_notas_dev", JSON.stringify(stateToSave));
    }

    const camposFiltro: FilterField[] = [
        {
            id: "proveedor",
            label: "Proveedor",
            type: "select",
            placeholder: "Todos los proveedores",
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
                { value: "Aprobado", label: "Aprobado" },
                { value: "Anulado", label: "Anulado" }
            ]
        },
        { id: "fechaDesde", label: "Fecha Desde", type: "date" },
        { id: "fechaHasta", label: "Fecha Hasta", type: "date" }
    ]

    const formatearNumeroNota = (numero: number | string) => {
        return `ND-${String(numero).padStart(4, "0")}`
    }

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }))
        setCurrentPage(1)
    }

    const handleLimpiarFiltros = () => {
        setFilters({ proveedor: "", estado: "", fechaDesde: "", fechaHasta: "" });
        setCurrentPage(1);
        sessionStorage.removeItem("filters_notas_dev");
    };

    const getEstadoStyle = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'aprobado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'anulado': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };
    const cargarDatosPagina = async () => {
        setIsLoading(true)
        try {
            const obtenerTodoRecursivo = async (p: number, acumulado: NotaDevolucionCompraDTO[]): Promise<NotaDevolucionCompraDTO[]> => {
                const res = await notasDevolucionesCompraAPI.getAll(p, 50);
                const items = res.items || res || [];
                const total = [...acumulado, ...items];

                if (!res.totalPages || p >= res.totalPages || items.length === 0) {
                    return total;
                }
                return obtenerTodoRecursivo(p + 1, total);
            };

            const [itemsNotas, resProveedores, resFacturas] = await Promise.all([
                obtenerTodoRecursivo(1, []),
                proveedoresAPI.getAll(1, 300),
                FacturasCompraAPI.getAll(1, 500) 
            ])

            const proveedoresList = resProveedores.items || resProveedores || []
            const facturasList = resFacturas.items || resFacturas || []

            const notasEnriquecidas = itemsNotas.map((nota) => {
                const factura = facturasList.find((f: { idFacturaCompra: number; idProveedor: number }) => f.idFacturaCompra === nota.idFacturaCompra)
                const idProv = factura ? factura.idProveedor : null
                const proveedorData = idProv ? proveedoresList.find((p) => p.idProveedor === idProv) : null

                return {
                    ...nota,
                    idProveedor: idProv,
                    proveedor: proveedorData ? proveedorData.razonSocial : "Desconocido" 
                }
            })

            setAllNotas(notasEnriquecidas)
            setProveedores(proveedoresList)
        } catch (error) {
            console.error("Error al sincronizar datos:", error)
            notify.error("Error de conexión", "No se pudieron recuperar los registros del servidor.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        cargarDatosPagina()
    }, [])

    const notasFiltradas = useMemo(() => {
        return allNotas.filter((n) => {
            const cumpleProveedor = filters.proveedor ? String(n.idProveedor) === filters.proveedor : true
            const cumpleEstado = filters.estado ? n.estado?.toLowerCase() === filters.estado.toLowerCase() : true

            const fechaNota = n.fecha ? n.fecha.substring(0, 10) : ""
            const cumpleDesde = filters.fechaDesde ? fechaNota >= filters.fechaDesde : true
            const cumpleHasta = filters.fechaHasta ? fechaNota <= filters.fechaHasta : true

            return cumpleProveedor && cumpleEstado && cumpleDesde && cumpleHasta
        })
    }, [allNotas, filters])

    const totalPages = useMemo(() => {
        const pages = Math.ceil(notasFiltradas.length / itemsPerPage)
        return pages > 0 ? pages : 1
    }, [notasFiltradas, itemsPerPage])

    const notasPaginadas = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return notasFiltradas.slice(startIndex, endIndex)
    }, [notasFiltradas, currentPage, itemsPerPage])

    const handleCrearNuevo = () => {
        guardarSnapshotFiltros()
        router.push("/compras/notas-de-devolucion/generar")
    }

    const handleEditar = (n: NotaDevolucionCompraDTO) => {
        guardarSnapshotFiltros()
        router.push(`/compras/notas-de-devolucion/${n.idNotaDevolucionCompra}/editar`)
    }

    const handleVerDetalle = (n: NotaDevolucionCompraDTO) => {
        guardarSnapshotFiltros()
        router.push(`/compras/notas-de-devolucion/${n.idNotaDevolucionCompra}/editar?readOnly=true`)
    }

    const confirmarEliminacion = async () => {
        if (notaAEliminar) {
            try {
                await notasDevolucionesCompraAPI.delete(notaAEliminar.idNotaDevolucionCompra)
                notify.success("Eliminado", "La nota de devolución fue removida exitosamente.")
                await cargarDatosPagina()
            } catch (error) {
                console.error(error)
                notify.error("Error", "No se puede eliminar la nota por dependencias.")
            } finally {
                setIsAlertOpen(false)
                setNotaAEliminar(null)
            }
        }
    }

    const handleAprobar = async (n: NotaDevolucionCompraDTO) => {
        try {
            // Se llamará a un endpoint que actualizará el estado, el stock y la cuenta
            // Por ahora, solo actualiza el estado a Aprobado si tu backend soporta /estado
            await notasDevolucionesCompraAPI.updateEstado(n.idNotaDevolucionCompra, { estado: "Aprobado" })
            notify.success("Aprobada", `Nota ${formatearNumeroNota(n.idNotaDevolucionCompra)} aprobada correctamente.`)
            await cargarDatosPagina()
        } catch (error: any) {
            console.error("Error al aprobar:", error)
            notify.error("Error", error?.response?.data?.message || "Ocurrió un error al intentar aprobar la nota.")
        }
    }

    const handleAnular = async (n: NotaDevolucionCompraDTO) => {
        if (!confirm(`¿Está seguro de que desea anular la nota ${formatearNumeroNota(n.idNotaDevolucionCompra)}?`)) return;
        try {
            await notasDevolucionesCompraAPI.updateEstado(n.idNotaDevolucionCompra, { estado: "Anulado" })
            notify.success("Anulada", `Nota ${formatearNumeroNota(n.idNotaDevolucionCompra)} anulada correctamente.`)
            await cargarDatosPagina()
        } catch (error: any) {
            console.error("Error al anular:", error)
            notify.error("Error", error?.response?.data?.message || "Ocurrió un error al intentar anular la nota.")
        }
    }

    const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

    return (
        <>
            <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Notas de Devolución" }]} />

            <PageHeader
                title="Listado de Notas de Devolución"
                buttonLabel="Nueva Nota"
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
                            Esta acción eliminará la nota de devolución permanentemente.
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
                    caption="Historial de devoluciones a proveedores."
                    headerRow={
                        <TableRow>
                            <TableHead className="w-32">Nro Nota</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="w-48">Motivo</TableHead>
                            <TableHead className="w-36">Fecha</TableHead>
                            <TableHead className="w-36">Estado</TableHead>
                            <TableHead className="text-right w-36">Acciones</TableHead>
                        </TableRow>
                    }
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                >
                    {notasPaginadas.map((n) => {
                        const esModificable = n.estado === "Pendiente"

                        return (
                            <TableRow key={n.idNotaDevolucionCompra} className="hover:bg-muted/40 transition-colors">
                                <TableCell className="font-mono text-xs font-bold text-primary">
                                    {formatearNumeroNota(n.idNotaDevolucionCompra)}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                    {n.proveedor || "No asignado"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={n.motivo}>
                                    {n.motivo || "—"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {n.fecha ? n.fecha.substring(0, 10) : "—"}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 rounded-full text-xs font-bold border uppercase tracking-wide text-[10px] ${getEstadoStyle(n.estado)}`}>
                                        {n.estado || "Desconocido"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleVerDetalle(n)} className="cursor-pointer" title="Inspeccionar">
                                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    {esModificable && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleAprobar(n)} className="cursor-pointer" title="Aprobar">
                                                <CheckCircle className="size-3.5 text-emerald-600 hover:text-emerald-700 transition-colors" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditar(n)} className="cursor-pointer" title="Editar">
                                                <Pencil className="size-3.5 text-muted-foreground hover:text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleAnular(n)} className="cursor-pointer" title="Anular">
                                                <Ban className="size-3.5 text-rose-500 hover:text-rose-700 transition-colors" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setNotaAEliminar(n)
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