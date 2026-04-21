"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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

import { PedidoForm } from "@/components/compras/pedido-form" // El que crearemos abajo
import { pedidosAPI } from "@/services/pedidosAPI"
import { PedidoDTO } from "@/types/types"

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [pedidoAEditar, setPedidoAEditar] = useState<PedidoDTO | null>(null)
  const [pedidoAEliminar, setPedidoAEliminar] = useState<PedidoDTO | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const res = await pedidosAPI.getAll()
      setPedidos(res)
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarPagina() }, [])

  const handleCrearNuevo = () => { setPedidoAEditar(null); setIsSheetOpen(true); }
  const handleEditar = (p: PedidoDTO) => { setPedidoAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
    if (pedidoAEliminar) {
      try {
        await pedidosAPI.delete(pedidoAEliminar.idPedido)
        await cargarPagina()
      } catch (error) { console.error(error) }
      finally { setIsAlertOpen(false); setPedidoAEliminar(null); }
    }
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "Compras", href: "#" }, { label: "Pedidos" }]} />

        <PageHeader title="Gestión de Pedidos" buttonLabel="Nuevo Pedido" onButtonClick={handleCrearNuevo} />

        {/* ALERT DIALOG ELIMINAR */}
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar pedido?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borrará el pedido de <span className="font-bold">"{pedidoAEliminar?.nombreFantasia}"</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmarEliminacion} className="bg-destructive text-white">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <DataTable
            caption="Registro histórico de pedidos a proveedores."
            headerRow={
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            }
          >
            {pedidos.map((p) => (
              <TableRow key={p.idPedido}>
                <TableCell>{p.fecha}</TableCell>
                <TableCell className="font-medium">{p.nombreFantasia}</TableCell>
                <TableCell className="text-right">${p.total.toFixed(2)}</TableCell>
                <TableCell className="text-center">{p.estado}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditar(p)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setPedidoAEliminar(p); setIsAlertOpen(true); }}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}

        {/* SHEET DE PEDIDO - Aquí es donde "crece" a pantalla casi completa */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[90vw] lg:max-w-[80vw] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{pedidoAEditar ? "Detalle del Pedido" : "Nuevo Pedido"}</SheetTitle>
              <SheetDescription>Administra los productos y el proveedor del pedido.</SheetDescription>
            </SheetHeader>

            <PedidoForm
              pedidoEditado={pedidoAEditar}
              onCancel={() => setIsSheetOpen(false)}
              onSuccess={() => { setIsSheetOpen(false); cargarPagina(); }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}