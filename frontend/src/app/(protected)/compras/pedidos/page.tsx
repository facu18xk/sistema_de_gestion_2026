"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Loader2 } from "lucide-react"
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

import { useRouter } from "next/navigation"
import { pedidosAPI } from "@/services/pedidosAPI"
import { PedidoDTO } from "@/types/types"
import { notify } from "@/lib/notifications"

export default function PedidosPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoDTO | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)

    try {
      const resPaginada = await pedidosAPI.getAll(currentPage, itemsPerPage)

      setPedidos(resPaginada.items)
      setTotalPages(resPaginada.totalPages)
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      notify.error("Error de conexión", "No se pudo obtener la lista de pedidos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarPagina()
  }, [currentPage])

  // 2. ACCIONES
  const handleCrearNuevo = () => {
    router.push("/compras/pedidos/nuevo")
  }

  const handleEditar = (p: PedidoDTO) => {
    router.push(`/compras/pedidos/${p.idPedidoCompra}/editar`)
  }

  const confirmarEliminacion = async () => {
    if (pedidoAEliminar) {
      try {
        await pedidosAPI.delete(pedidoAEliminar.idPedidoCompra)
        notify.success("Eliminado", "El pedido fue eliminado correctamente.")
        await cargarPagina()
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
    <div className="container mx-auto p-6 space-y-6">
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Pedidos" }]} />

      {/*BOTÓN ADD*/}
      <PageHeader
        title="Listado de Pedidos"
        buttonLabel="Nuevo Pedido"
        onButtonClick={handleCrearNuevo}
      />

      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente el pedido{" "}
              <span className="font-bold text-foreground">
                "{pedidoAEliminar?.numeroPedido}"
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

      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
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
          {pedidos.map((p) => (
            <TableRow key={p.idPedidoCompra}>
              <TableCell>{p.numeroPedido}</TableCell>
              <TableCell>{p.fecha.substring(0, 10)}</TableCell>
              <TableCell>{p.estado}</TableCell>

              <TableCell className="text-right space-x-1">
                {p.estado === "Pendiente" && (
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
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
      </div>
    </>
  )
}