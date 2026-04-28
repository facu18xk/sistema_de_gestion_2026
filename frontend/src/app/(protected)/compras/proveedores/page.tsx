"use client"

import { Proveedor, Pais, ProveedorSaveDTO } from "@/types/types"
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
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null)
  const [paises, setPaises] = useState<Pais[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const [resPaginada, resPaises] = await Promise.all([
        proveedoresAPI.getAll(currentPage, itemsPerPage),
        ubicacionesAPI.getPaises()
      ])

      setProveedores(resPaginada.items)
      setPaises(resPaises.items)
      setTotalPages(resPaginada.totalPages)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      notify.error("Error de conexión", "No se pudieron obtener los datos.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarPagina() }, [currentPage])

  const handleCrearNuevo = () => {
    setProveedorAEditar(null);
    setIsSheetOpen(true);
  }

  const handleEditar = (p: Proveedor) => {
    setProveedorAEditar(p);
    setIsSheetOpen(true);
  }

  const confirmarEliminacion = async () => {
    if (proveedorAEliminar) {
      try {
        await proveedoresAPI.delete(proveedorAEliminar.idProveedor)
        notify.success("Eliminado", "El proveedor ha sido removido.")
        await cargarPagina()
      } catch (error) {
        notify.error("Error", "No se pudo eliminar el proveedor.")
      } finally {
        setIsAlertOpen(false)
        setProveedorAEliminar(null)
      }
    }
  }

  // LOGICA CORREGIDA: Mapeo de datos del Formulario al DTO de la API
  const handleFormSubmit = async (formData: any) => {
    try {
      // Construimos el objeto exacto que pide el Swagger (ProveedorSaveDTO)
      const dataToSave: ProveedorSaveDTO = {
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        nombreFantasia: formData.nombreFantasia,
        nombres: formData.nombres || null,
        apellidos: formData.apellidos || null,
        correo: formData.correo || null,
        telefono: formData.telefono || null,
        // Agrupamos los campos de dirección
        direccion: {
          calle1: formData.calle1,
          calle2: formData.calle2 || null,
          descripcion: formData.descripcionDireccion || null,
          idCiudad: Number(formData.idCiudad)
        },
        // Renombramos la lista de IDs de categorías
        categoriaIds: formData.idCategorias || []
      };

      if (proveedorAEditar) {
        await proveedoresAPI.update(proveedorAEditar.idProveedor, dataToSave)
        notify.success("Actualizado", "Proveedor actualizado correctamente.")
      } else {
        await proveedoresAPI.create(dataToSave)
        notify.success("Registrado", "Nuevo proveedor guardado.")
      }

      setIsSheetOpen(false)
      cargarPagina()
    } catch (error) {
      console.error("Error al guardar:", error)
      notify.error("Error", "No se pudo procesar la solicitud.")
    }
  }

  return (
    <>
      <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Proveedores" }]} />

      <PageHeader
        title="Listado de Proveedores"
        buttonLabel="Nuevo Proveedor"
        onButtonClick={handleCrearNuevo}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente a{" "}
              <span className="font-bold text-foreground">
                "{proveedorAEliminar?.nombreFantasia}"
              </span>.
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

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <DataTable
          caption="Lista de proveedores y distribuidores."
          headerRow={
            <TableRow>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setProveedorAEliminar(p); setIsAlertOpen(true); }}
                  className="cursor-pointer"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}

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
            onRefreshPaises={() => cargarPagina()}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}