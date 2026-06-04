"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Eye, Trash2, Loader2, X, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { FilterBar, FilterField } from "@/components/shared/filter-bar"
import { FacturaCompra, Proveedor } from "@/types/types"
import { notify } from "@/lib/notifications"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export const formatOrdenNro = (id: number | string) => {
    return `OC-${String(id).padStart(4, "0")}`
}

export default function FacturasPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando facturas...</div>}>
            <FacturasPageContent />
        </Suspense>
    )
}

function FacturasPageContent() {
    const searchParams = useSearchParams()

    const [facturas, setFacturas] = useState<FacturaCompra[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Recupera la página persistida en la sesión
    const [pagina, setPagina] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("filters_facturas")
            if (saved) {
                try { return JSON.parse(saved).pagina || 1 } catch { return 1 }
            }
        }
        return 1
    })

    // Estado inicial de filtros para Facturas
    const [filters, setFilters] = useState<Record<string, string>>(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("filters_facturas")
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    if (parsed.filters) return parsed.filters
                } catch { }
            }
        }
        return {
            ordenOrigen: "",
            proveedor: "",
            fechaDesde: "",
            fechaHasta: "",
            estado: "",
        }
    })

    const [totalPaginas, setTotalPaginas] = useState(1)
    const [isAlertOpen, setIsAlertOpen] = useState(false)
    const [facturaAEliminar, setFacturaAEliminar] = useState<FacturaCompra | null>(null)

    // Cargar parámetros de URL si viene redirigido desde Órdenes de Compra
    useEffect(() => {
        const urlOrdenId = searchParams.get("idOrdenCompra")
        if (urlOrdenId) {
            setFilters((prev) => ({
                ...prev,
                ordenOrigen: urlOrdenId,
            }))
            setPagina(1)
        }
    }, [searchParams])

    // Cargar lista de proveedores para el selector de filtros
    useEffect(() => {
        const cargarMaestros = async () => {
            try {
                const res = await proveedoresAPI.getAll(1, 200)
                setProveedores(res.items || res || [])
            } catch (err) {
                console.error("Error cargando proveedores para filtros:", err)
            }
        }
        cargarMaestros()
    }, [])

    // Guardar filtros actuales en sessionStorage
    useEffect(() => {
        const stateToSave = { filters, pagina }
        sessionStorage.setItem("filters_facturas", JSON.stringify(stateToSave))
    }, [filters, pagina])

    const cargarPagina = async (numPagina: number) => {
        setIsLoading(true)
        try {
            const obtenerTodoRecursivo = async (p: number, acumulado: any[]): Promise<any[]> => {
                const res = await FacturasCompraAPI.getAll(p, 50)
                const items = res.items || res || []
                const total = [...acumulado, ...items]

                if (!res.totalPages || p >= res.totalPages || items.length === 0) {
                    return total
                }
                return obtenerTodoRecursivo(p + 1, total)
            }

            let registros = await obtenerTodoRecursivo(1, [])

            // Aplicación de filtros en memoria
            if (filters.ordenOrigen) {
                registros = registros.filter((f: any) =>
                    f.idOrdenCompra && String(f.idOrdenCompra).includes(filters.ordenOrigen)
                )
            }
            if (filters.proveedor) {
                registros = registros.filter(
                    (f: any) => String(f.idProveedor) === filters.proveedor
                )
            }
            if (filters.fechaDesde) {
                registros = registros.filter((f: any) => f.fecha && f.fecha >= filters.fechaDesde)
            }
            if (filters.fechaHasta) {
                registros = registros.filter((f: any) => f.fecha && f.fecha <= filters.fechaHasta)
            }
            if (filters.estado) {
                registros = registros.filter((f: any) => {
                    const idStr = String(f.idEstado || "").trim()
                    const estLower = String(f.estado || f.nombreEstado || "").toLowerCase().trim()

                    if (filters.estado === "1") {
                        return idStr === "1" || estLower.includes("pend")
                    }
                    if (filters.estado === "2") {
                        return idStr === "2" || estLower.includes("aprob")
                    }
                    if (filters.estado === "8") {
                        return idStr === "8" || estLower.includes("anul")
                    }
                    return idStr === filters.estado
                })
            }

            const calculadoTotalPaginas = Math.ceil(registros.length / 10) || 1
            setTotalPaginas(calculadoTotalPaginas)

            // Asegurar que la página actual no quede huérfana tras filtrar
            if (numPagina > calculadoTotalPaginas) {
                setPagina(calculadoTotalPaginas)
                return
            }

            const indiceInicial = (numPagina - 1) * 10
            const indiceFinal = indiceInicial + 10

            setFacturas(registros.slice(indiceInicial, indiceFinal))
        } catch (error) {
            console.error("Error al recuperar facturas:", error)
            notify.error("Error de carga", "No se pudo recuperar la lista de facturas.")
            setFacturas([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        cargarPagina(pagina)
    }, [pagina, filters])

    const handleFilterChange = (id: string, value: string) => {
        setFilters((prev) => ({ ...prev, [id]: value }))
        setPagina(1)
    }

    const handleLimpiarFiltros = () => {
        setFilters({
            ordenOrigen: "",
            proveedor: "",
            fechaDesde: "",
            fechaHasta: "",
            estado: "",
        })
        setPagina(1)
        sessionStorage.removeItem("filters_facturas")
        if (searchParams.get("idOrdenCompra")) {
            window.history.replaceState(null, "", "/compras/facturas")
        }
    }

    const handleEliminar = async () => {

        try {
            await FacturasCompraAPI.delete(facturaAEliminar?.idFacturaCompra || 0)
            notify.success("Eliminado", "La factura fue removida y la orden origen fue actualizada correctamente.")
            cargarPagina(pagina)
        } catch (error) {
            console.error("Error al eliminar factura:", error)
            notify.error("Error", "No se pudo eliminar el registro debido a dependencias con pagos o notas de crédito.")
        } finally {
            setIsAlertOpen(false)
            setFacturaAEliminar(null)
        }
    }

    const calcularTotalFactura = (f: FacturaCompra): number => {
        if (!f.detalles || !Array.isArray(f.detalles)) return 0
        return f.detalles.reduce((acc, det) => acc + (det.totalNeto || 0), 0)
    }

    const filterFields: FilterField[] = [
        {
            id: "ordenOrigen",
            label: "Nro Orden Origen",
            type: "text",
            placeholder: "Buscar por ID de orden..."
        },
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
                { label: "Aprobado", value: "2" },
                { label: "Anulado", value: "8" },
            ],
        },
    ]

    const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "")

    const getEstadoBadgeStyle = (estado: string, idEstado?: number) => {
        const est = estado?.toLowerCase() || ""
        const idStr = String(idEstado || "")

        if (idStr === "1" || est.includes("pend")) {
            return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
        }
        if (idStr === "2" || est.includes("aprob")) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
        }
        if (idStr === "8" || est.includes("anul")) {
            return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
        }
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
    }

    const getEstadoLiteral = (estado: string, idEstado?: number) => {
        if (estado) return estado
        if (idEstado === 1) return "Pendiente"
        if (idEstado === 2) return "Aprobado"
        if (idEstado === 8) return "Anulado"
        return `Estado ${idEstado}`
    }

    return (
        <div className="bg-background w-full">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Facturas de Proveedores" }]} />

            <main className="container w-full">
                <div className="flex justify-between items-center mb-2 mt-1">
                    <h5 className="font-bold tracking-tight">Facturas de Proveedores</h5>
                    <Link href="/compras/facturas/cargar">
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Registrar Factura
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
                                Se eliminará la factura de compra con comprobante Nro<span className="font-bold text-foreground">
                                    "{facturaAEliminar ? (facturaAEliminar.nroComprobante) : ""}"
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
                            Filtrando y mapeando facturas del servidor...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5 w-full">
                        <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full">
                            <Table className="w-full">
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-28">Fecha</TableHead>
                                        <TableHead className="w-36">Nro Comprobante</TableHead>
                                        <TableHead className="w-28">Timbrado</TableHead>
                                        <TableHead className="w-32 text-center">Nro Orden</TableHead>
                                        <TableHead>Proveedor</TableHead>
                                        <TableHead className="w-32">Estado</TableHead>
                                        <TableHead className="w-32 text-right">Monto Total</TableHead>
                                        <TableHead className="w-32 text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {facturas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                                                No se encontraron facturas con los criterios seleccionados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        facturas.map((f) => {
                                            const idEstadoNum = Number(f.idEstado)
                                            const esCRUDPermitido = idEstadoNum === 1 || (f.estado || "").toLowerCase().includes("pend")

                                            return (
                                                <TableRow key={f.idFacturaCompra} className="hover:bg-muted/40 transition-colors">
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {f.fecha ? f.fecha.substring(0, 10) : "—"}
                                                    </TableCell>

                                                    <TableCell className="font-mono text-xs font-bold text-foreground">
                                                        {f.nroComprobante}
                                                    </TableCell>

                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {f.timbrado || "—"}
                                                    </TableCell>

                                                    <TableCell className="text-xs font-mono">
                                                        {f.idOrdenCompra ? (
                                                            <Link href={`/compras/ordenes/${f.idOrdenCompra}/editar?view=true`}>
                                                                <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline bg-blue-50/50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-left cursor-pointer">
                                                                    {formatOrdenNro(f.idOrdenCompra)}
                                                                </span>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-[11px] text-muted-foreground italic">
                                                                Directa
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-xs font-medium">
                                                        {f.proveedor || `Proveedor #${f.idProveedor}`}
                                                    </TableCell>

                                                    <TableCell className="text-xs">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getEstadoBadgeStyle(f.estado, f.idEstado)}`}>
                                                            {getEstadoLiteral(f.estado, f.idEstado)}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-right font-bold font-mono text-foreground">
                                                        {calcularTotalFactura(f).toLocaleString("es-PY")} Gs.
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-end  gap-1">
                                                            <Link href={`/compras/facturas/${f.idFacturaCompra}/editar?view=true`}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-primary transition"
                                                                    title="Visualizar Detalle"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>

                                                            {esCRUDPermitido && (
                                                                <>
                                                                    <Link href={`/compras/facturas/${f.idFacturaCompra}/editar`}>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                                            title="Editar Factura"
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </Link>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            setFacturaAEliminar(f)
                                                                            setIsAlertOpen(true)
                                                                        }}
                                                                        className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                                        title="Eliminar Factura"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Bloque de Paginar */}
                        {totalPaginas > 1 && (
                            <div className="flex items-center justify-between border rounded-lg bg-card p-2 shadow-xs w-full">
                                <div className="text-xs text-muted-foreground pl-1">
                                    Página <span className="font-semibold text-foreground">{pagina}</span> de{" "}
                                    <span className="font-semibold text-foreground">{totalPaginas}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2 text-xs gap-1 font-medium"
                                        onClick={() => setPagina((p: number) => Math.max(p - 1, 1))}
                                        disabled={pagina === 1}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2 text-xs gap-1 font-medium"
                                        onClick={() => setPagina((p: number) => Math.min(p + 1, totalPaginas))}
                                        disabled={pagina === totalPaginas}
                                    >
                                        Siguiente
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
