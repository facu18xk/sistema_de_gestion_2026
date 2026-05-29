"use client"

import { Proveedor, Pais, ProveedorSaveDTO } from "@/types/types"
import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Eye } from "lucide-react"
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
import { FilterBar, FilterField } from "@/components/shared/filter-bar"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI"
import { notify } from "@/lib/notifications"

export default function ProveedoresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [allProveedores, setAllProveedores] = useState<Proveedor[]>([])
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null)
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null)
  const [paises, setPaises] = useState<Pais[]>([])

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isReadOnlyMode, setIsReadOnlyMode] = useState(false)

  const [filters, setFilters] = useState<Record<string, string>>({
    nombre: "",
    ruc: "",
    razonSocial: ""
  })

  const camposFiltro: FilterField[] = [
    { id: "nombre", label: "Buscar por Nombre Fantasía", type: "text", placeholder: "Ej: Distribuidora..." },
    { id: "ruc", label: "Buscar por RUC", type: "text", placeholder: "Ej: 8000100-0" },
    { id: "razonSocial", label: "Buscar por Razón Social", type: "text", placeholder: "Ej: S.A. o S.R.L." }
  ]

  const handleFilterChange = (id: string, value: string) => {
    setFilters(prev => ({ ...prev, [id]: value }))
    setCurrentPage(1)
  }

  const cargarTodosLosProveedores = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await proveedoresAPI.getAll(1, 99999);
      setAllProveedores(resPaginada.items || []);
    } catch (error) {
      console.error("Error al cargar datos de proveedores:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de proveedores.")
    } finally {
      setIsLoading(false)
    }
  }

  const cargarPaises = async () => {
    try {
      const resPaises = await ubicacionesAPI.getPaises();
      setPaises(resPaises.items)
    } catch (error) {
      console.error("Error al cargar datos de países:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de países.")
    }
  }

  useEffect(() => { cargarPaises() }, []);
  useEffect(() => { cargarTodosLosProveedores() }, []);

  const proveedoresFiltrados = useMemo(() => {
    return allProveedores.filter((p) => {
      const cumpleNombre = p.nombreFantasia?.toLowerCase().includes((filters.nombre || "").toLowerCase().trim());
      const cumpleRuc = p.ruc?.toLowerCase().includes((filters.ruc || "").toLowerCase().trim());
      const cumpleRazonSocial = p.razonSocial?.toLowerCase().includes((filters.razonSocial || "").toLowerCase().trim());
      return cumpleNombre && cumpleRuc && cumpleRazonSocial;
    });
  }, [allProveedores, filters]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
    return pages > 0 ? pages : 1;
  }, [proveedoresFiltrados, itemsPerPage]);

  const proveedoresPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return proveedoresFiltrados.slice(startIndex, endIndex);
  }, [proveedoresFiltrados, currentPage, itemsPerPage]);

  const handleCrearNuevo = () => {
    setProveedorAEditar(null);
    setIsReadOnlyMode(false);
    setIsSheetOpen(true);
  }

  const handleEditar = (p: Proveedor) => {
    setProveedorAEditar(p);
    setIsReadOnlyMode(false);
    setIsSheetOpen(true);
  }

  const handleVerDetalle = (p: Proveedor) => {
    setProveedorAEditar(p);
    setIsReadOnlyMode(true);
    setIsSheetOpen(true);
  }

  const confirmarEliminacion = async () => {
    if (proveedorAEliminar) {
      try {
        await proveedoresAPI.delete(proveedorAEliminar.idProveedor)
        notify.success("Eliminado", "El proveedor ha sido removido.")
        await cargarTodosLosProveedores()
      } catch (error) {
        notify.error("Error", "No se pudo eliminar el proveedor.")
      } finally {
        setIsAlertOpen(false)
        setProveedorAEliminar(null)
      }
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      const dataToSave: ProveedorSaveDTO = {
        ruc: formData.ruc,
        razonSocial: formData.razonSocial,
        nombreFantasia: formData.nombreFantasia,
        nombres: formData.nombres || null,
        apellidos: formData.apellidos || null,
        correo: formData.correo || null,
        telefono: formData.telefono || null,
        direccion: {
          calle1: formData.calle1,
          calle2: formData.calle2 || null,
          descripcion: formData.descripcionDireccion || null,
          idCiudad: Number(formData.idCiudad)
        },
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
      cargarTodosLosProveedores()
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
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {proveedoresPaginados.map((p) => (
            <TableRow key={p.idProveedor}>
              <TableCell className="text-foreground">{p.nombreFantasia}</TableCell>
              <TableCell>{p.razonSocial}</TableCell>
              <TableCell className="font-mono text-sm">{p.ruc}</TableCell>
              <TableCell>
                <span className="text-sm">{p.correo || "Sin correo"}</span>
              </TableCell>
              <TableCell className="text-sm">
                {p.telefono || "Sin teléfono"}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleVerDetalle(p)} className="cursor-pointer">
                  <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setProveedorAEliminar(p); setIsAlertOpen(true); }}
                  className="cursor-pointer"
                >
                  <Trash2 className="size-3.5 text-foreground hover:text-destructive transition-colors" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="px-6 sm:max-w-[540px] sm:min-w-[450px]">
          <SheetHeader className=" border-b pt-4">
            <SheetTitle>
              {isReadOnlyMode ? "Detalles del Proveedor" : proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}
            </SheetTitle>
            <SheetDescription>Información comercial y fiscal del proveedor.</SheetDescription>
          </SheetHeader>
          <ProveedorForm
            key={proveedorAEditar?.idProveedor ?? "nuevo"}
            proveedorEditado={proveedorAEditar}
            paises={paises}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
            onRefreshPaises={() => cargarTodosLosProveedores()}
            isReadOnly={isReadOnlyMode}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}