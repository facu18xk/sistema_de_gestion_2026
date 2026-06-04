"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { FilterBar, FilterField } from "@/components/shared/filter-bar"
import { useRouter } from "next/navigation"
import { notasCreditosCompraAPI } from "@/services/notasCreditosCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { NotaCreditoCompraDTO, Proveedor } from "@/types/types"
import { notify } from "@/lib/notifications"

export default function NotasCreditoPage() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [allNotas, setAllNotas] = useState<NotaCreditoCompraDTO[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>()

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [filters, setFilters] = useState<Record<string, string>>({
        proveedor: "",
        fechaDesde: "",
        fechaHasta: ""
    })

    useEffect(() => {
        const savedFilters = sessionStorage.getItem("filters_notas_cred");
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
        sessionStorage.setItem("filters_notas_cred", JSON.stringify(stateToSave));
    }

    const proveedoresConNotas = useMemo(() => {
        if (!proveedores || !allNotas) return [];
        const idsConNotas = new Set(allNotas.map(n => n.idProveedor));
        return proveedores.filter(p => idsConNotas.has(p.idProveedor));
    }, [proveedores, allNotas]);

    const camposFiltro: FilterField[] = [
        {
            id: "proveedor",
            label: "Proveedor",
            type: "select",
            options: proveedoresConNotas.map(p => ({
                value: String(p.idProveedor),
                label: String(p.razonSocial || p.nombreFantasia || p.idProveedor),
            })) || [],
        },
        { id: "fechaDesde", label: "Fecha Desde", type: "date" },
        { id: "fechaHasta", label: "Fecha Hasta", type: "date" }
    ]

    const formatearNumeroNota = (numero: number | string) => {
        return `NC-${String(numero).padStart(4, "0")}`
    }

    const handleFilterChange = (id: string, value: string) => {
        setFilters(prev => ({ ...prev, [id]: value }))
        setCurrentPage(1)
    }

    const handleLimpiarFiltros = () => {
        setFilters({ proveedor: "", fechaDesde: "", fechaHasta: "" });
        setCurrentPage(1);
        sessionStorage.removeItem("filters_notas_cred");
    };

    const cargarDatosPagina = async () => {
        setIsLoading(true)
        try {
            const obtenerTodoRecursivo = async (p: number, acumulado: NotaCreditoCompraDTO[]): Promise<NotaCreditoCompraDTO[]> => {
                const res = await notasCreditosCompraAPI.getAll(p, 50);
                const items = res.items || res || [];
                const total = [...acumulado, ...items];

                if (!res.totalPages || p >= res.totalPages || items.length === 0) {
                    return total;
                }
                return obtenerTodoRecursivo(p + 1, total);
            };

            const [itemsNotas, resProveedores] = await Promise.all([
                obtenerTodoRecursivo(1, []),
                proveedoresAPI.getAll(1, 300)
            ])

            const proveedoresList = resProveedores.items || resProveedores || []

            setAllNotas(itemsNotas)
            setProveedores(proveedoresList)
        } catch (error) {
            console.error("Error al sincronizar datos:", error)
            notify.error("Error de conexión", "No se pudieron recuperar los registros de Notas de Crédito.")
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

            const fechaNota = n.fechaEmision ? n.fechaEmision.substring(0, 10) : ""
            const cumpleDesde = filters.fechaDesde ? fechaNota >= filters.fechaDesde : true
            const cumpleHasta = filters.fechaHasta ? fechaNota <= filters.fechaHasta : true

            return cumpleProveedor && cumpleDesde && cumpleHasta
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

    const handleVerDetalle = (n: NotaCreditoCompraDTO) => {
        guardarSnapshotFiltros()
        // Inspeccionamos la nota de devolución asociada
        router.push(`/compras/notas-de-devolucion/${n.idNotaDevolucionCompra}/editar?readOnly=true&source=credito`)
    }

    const tieneFiltrosActivos = Object.values(filters).some((val) => val !== "");

    return (
        <>
            <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Notas de Crédito" }]} />

            <PageHeader
                title="Notas de Crédito"
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

            {isLoading ? (
                <div className="flex justify-center p-6">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            ) : (
                <DataTable
                    caption="Historial de Notas de Crédito de Proveedores."
                    headerRow={
                        <TableRow>
                            <TableHead className="w-32">Nro Nota</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="w-48">Motivo</TableHead>
                            <TableHead className="w-36 text-right">Total</TableHead>
                            <TableHead className="w-36">Fecha</TableHead>
                            <TableHead className="text-right w-36">Acciones</TableHead>
                        </TableRow>
                    }
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                >
                    {notasPaginadas.map((n) => {
                        return (
                            <TableRow key={n.idNotaCreditoCompra} className="hover:bg-muted/40 transition-colors">
                                <TableCell className="font-mono text-xs font-bold text-primary">
                                    {formatearNumeroNota(n.idNotaCreditoCompra)}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                    {n.proveedor || "No asignado"}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]" title={n.motivo}>
                                    {n.motivo || "—"}
                                </TableCell>
                                <TableCell className="text-xs font-semibold text-right">
                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0 }).format(n.total || 0)}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {n.fechaEmision ? n.fechaEmision.substring(0, 10) : "—"}
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleVerDetalle(n)} className="cursor-pointer" title="Inspeccionar Devolución Asociada">
                                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </DataTable>
            )}
        </>
    )
}