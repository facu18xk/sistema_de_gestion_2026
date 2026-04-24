"use client"

import { Proveedor, Pais } from "@/types/types"
import { useState, useEffect } from "react"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProveedorForm } from "@/components/compras/proveedor-form"
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
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI"
import { notify } from "@/lib/notifications"

export default function ProveedoresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);
  const [paises, setPaises] = useState<Pais[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10) //10 por defecto

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resPaginada, resPaises] = await Promise.all([
        proveedoresAPI.getAll(currentPage, itemsPerPage),
        ubicacionesAPI.getPaises(1, 300)
      ])
      setProveedores(resPaginada.items);
      setPaises(resPaises.items);
      setTotalPages(resPaginada.totalPages);
    } catch (error) {
      console.error("Error al cargar datos de proveedores y/o países:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de proveedores.")
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { cargarPagina() }, [currentPage]);

  // 2. ACCIONES (CREAR / EDITAR / ELIMINAR)
  const handleCrearNuevo = () => { setProveedorAEditar(null); setIsSheetOpen(true); }

  const handleEditar = (p: Proveedor) => { setProveedorAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
      if (proveedorAEliminar) {
        try {
          await proveedoresAPI.delete(proveedorAEliminar.idProveedor);
          notify.success("Eliminado", "El proveedor ha sido removido del sistema.")
          await cargarPagina(); // Recarga la página actual
        } catch (error) {
          console.error("Error al eliminar el proveedor:", error);
          notify.error("Error al eliminar", "El proveedor podría tener registros asociados.")
        } finally {
          setIsAlertOpen(false);
          setProveedorAEliminar(null);
        }
      }
    };

  const handleFormSubmit = async (data: Proveedor) => {
    try {
      if (proveedorAEditar) {
        await proveedoresAPI.update(proveedorAEditar.idProveedor, data);
        notify.success("Proveedor actualizado", `${data.nombreFantasia} se actualizó correctamente.`)
      } else {
        await proveedoresAPI.create(data);
        notify.success("Proveedor registrado", "El nuevo proveedor ha sido guardado.")
      }
      setIsSheetOpen(false);
      cargarPagina();
    } catch (error) {
      console.error("Error al guardar el proveedor:", error);
      notify.error("Error al guardar", "Ocurrió un problema al procesar la solicitud.")
    }
  }

  return (
    <>
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Proveedores" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader title="Listado de Proveedores" buttonLabel="Nuevo Proveedor" onButtonClick={handleCrearNuevo} />
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Eliminarás permanentemente el proveedor{" "}
            <span className="font-bold text-foreground">
              "{proveedorAEliminar?.nombreFantasia}"
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
            Eliminar Proveedor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
      ) : (
        <DataTable
          caption="Lista de proveedores y distribuidores."
          headerRow={
            <TableRow>
              {/*<TableHead className="w-[80px]">ID</TableHead>*/}
              <TableHead>Nombre Fantasía</TableHead>
              <TableHead>Razón Social</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {proveedores.map((p) => (
            <TableRow key={p.idProveedor}>
              {/*<TableCell className="font-medium text-slate-500">{p.idProveedor}</TableCell>*/}
              <TableCell className="font-bold text-slate-900">{p.nombreFantasia}</TableCell>
              <TableCell>{p.razonSocial}</TableCell>
              <TableCell className="font-mono text-sm">{p.ruc}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{p.nombres} {p.apellidos}</span>
                  <span className="text-xs text-muted-foreground">{p.correo}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{p.telefono}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {setProveedorAEliminar(p); setIsAlertOpen(true);}} className="cursor-pointer">
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
      {/*SHEET LATERAL*/}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="px-6 sm:max-w-[540px] sm:min-w-[450px]">
          <SheetHeader>
            <SheetTitle>{proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}</SheetTitle>
            <SheetDescription>Información comercial y fiscal del proveedor.</SheetDescription>
          </SheetHeader>
          <ProveedorForm
            key={proveedorAEditar?.idProveedor ?? "nuevo"}
            proveedorEditado={proveedorAEditar}
            paises={paises}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}