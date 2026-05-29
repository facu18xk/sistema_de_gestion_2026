"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Eye, FileText } from "lucide-react"
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
import { pedidosAPI } from "@/services/pedidosAPI"
import { PedidoDTO } from "@/types/types"
import { notify } from "@/lib/notifications"

export default function PedidosPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [allPedidos, setAllPedidos] = useState<PedidoDTO[]>([])
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoDTO | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [filters, setFilters] = useState<Record<string, string>>({
    nroPedido: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: ""
  })

  const camposFiltro: FilterField[] = [
    {
      id: "nroPedido",
      label: "Buscar por Nro Pedido",
      type: "text",
      placeholder: "Ej: 7 o PD-0007"
    },
    {
      id: "estado",
      label: "Estado",
      type: "select",
      placeholder: "Todos los estados",
      options: [
        { value: "Pendiente", label: "Pendiente" },
        { value: "Enviado", label: "Enviado" },
        { value: "Aprobado", label: "Aprobado" },
        { value: "Respondido", label: "Respondido" }
      ]
    },
    {
      id: "fechaDesde",
      label: "Fecha Desde",
      type: "date"
    },
    {
      id: "fechaHasta",
      label: "Fecha Hasta",
      type: "date"
    }
  ]


  const formatearNumeroPedido = (numero: number | string) => {
    return `PD-${String(numero).padStart(4, "0")}`
  }

  const handleFilterChange = (id: string, value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }))
    setCurrentPage(1)
  }

  const getEstadoStyle = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'aprobado':
      case 'completado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelado':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };
  const cargarTodosLosPedidos = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await pedidosAPI.getAll(1, 99999)
      setAllPedidos(resPaginada.items || [])
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      notify.error("Error de conexión", "No se pudo obtener la lista de pedidos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarTodosLosPedidos()
  }, [])

  const pedidosFiltrados = useMemo(() => {
    return allPedidos.filter((p) => {
      const nroFormateado = formatearNumeroPedido(p.idPedidoCompra).toLowerCase()
      const nroLimpio = p.idPedidoCompra.toString()
      const filtroNro = (filters.nroPedido || "").toLowerCase().trim().replace("pd-", "")

      const cumpleNro = nroFormateado.includes(filtroNro) || nroLimpio.includes(filtroNro)

      const cumpleEstado = filters.estado
        ? p.estado.toLowerCase() === filters.estado.toLowerCase()
        : true

      const fechaPedido = p.fecha.substring(0, 10)

      const cumpleDesde = filters.fechaDesde
        ? fechaPedido >= filters.fechaDesde
        : true

      const cumpleHasta = filters.fechaHasta
        ? fechaPedido <= filters.fechaHasta
        : true

      return cumpleNro && cumpleEstado && cumpleDesde && cumpleHasta
    })
  }, [allPedidos, filters])

  const totalPages = useMemo(() => {
    const pages = Math.ceil(pedidosFiltrados.length / itemsPerPage)
    return pages > 0 ? pages : 1
  }, [pedidosFiltrados, itemsPerPage])

  const pedidosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return pedidosFiltrados.slice(startIndex, endIndex)
  }, [pedidosFiltrados, currentPage, itemsPerPage])

  const handleCrearNuevo = () => {
    router.push("/compras/pedidos/nuevo")
  }

  const handleEditar = (p: PedidoDTO) => {
    router.push(`/compras/pedidos/${p.idPedidoCompra}/editar`)
  }

  const handleVerDetalle = (p: PedidoDTO) => {
    router.push(`/compras/pedidos/${p.idPedidoCompra}/editar?readOnly=true`)
  }

  const handleVerCotizaciones = (p: PedidoDTO) => {
    router.push(`/compras/cotizaciones?idPedidoCompra=${p.idPedidoCompra}`)
  }

  const confirmarEliminacion = async () => {
    if (pedidoAEliminar) {
      try {
        await pedidosAPI.delete(pedidoAEliminar.idPedidoCompra)
        notify.success("Eliminado", "El pedido fue eliminado correctamente.")
        await cargarTodosLosPedidos()
      } catch (error) {
        console.error("Error al eliminar pedido:", error)
        notify.error("Error al eliminar", "El pedido podría tener registros asociados.")
      } finally {
        setIsAlertOpen(false)
        setPedidoAEliminar(null)
      }
    }
  }

  return (
    <>
      <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Pedidos" }]} />

      <PageHeader
        title="Listado de Pedidos"
        buttonLabel="Nuevo Pedido"
        onButtonClick={handleCrearNuevo}
      />

      <FilterBar
        fields={camposFiltro}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente el pedido{" "}
              <span className="font-bold text-foreground">
                "{pedidoAEliminar ? formatearNumeroPedido(pedidoAEliminar.idPedidoCompra) : ""}"
              </span>{" "}
              y se quitará del servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          caption="Lista de pedidos de compra."
          headerRow={
            <TableRow>
              <TableHead>Nro Pedido</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {pedidosPaginados.map((p) => {
            const esModificable = p.estado === "Pendiente"

            return (
              <TableRow key={p.idPedidoCompra}>
                <TableCell>{formatearNumeroPedido(p.idPedidoCompra)}</TableCell>
                <TableCell>{p.fecha.substring(0, 10)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoStyle(p.estado)}`}>
                    {p.estado}
                  </span>

                </TableCell>

                <TableCell className="text-right space-x-1">
                  {p.estado === "Respondido" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVerCotizaciones(p)}
                      className="cursor-pointer text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      title="Ver Cotizaciones"
                    >
                      <FileText className="size-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVerDetalle(p)}
                    className="cursor-pointer"
                  >
                    <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                  {esModificable && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditar(p)}
                        className="cursor-pointer"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPedidoAEliminar(p)
                          setIsAlertOpen(true)
                        }}
                        className="cursor-pointer"
                      >
                        <Trash2 className="size-3.5 text-foreground hover:text-destructive transition-colors" />
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