"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServicioForm } from "@/components/stock/servicio-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
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

import { productosAPI } from "@/services/productosAPI"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ProductoDTO, ProductoSaveDTO, Marca, Categoria } from "@/types/types"
import { formatGuaranies } from "@/utils/money-format"
import { notify } from "@/lib/notifications"

const columnWidths = {
  descripcion: "w-[200px]",
  categoria: "w-[100px]",
  precio: "w-[120px]",
  iva: "w-[120px]",
  acciones: "w-[100px]",
};

export default function ServiciosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [todosLosServicios, setTodosLosServicios] = useState<ProductoDTO[]>([]);
  const [servicioAEditar, setServicioAEditar] = useState<ProductoDTO | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<ProductoDTO | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); //10 por defecto
  const [searchTerm, setSearchTerm] = useState("");

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const resPaginada = await productosAPI.getAll(currentPage, 100);
      const soloServicios = resPaginada.items.filter((s) => s.esServicio === true);
      const ordenados = [...soloServicios].sort((a, b) => {
        const porDescripcion = a.descripcion.localeCompare(b.descripcion, 'es-PY');
        return porDescripcion;
      });
      setTodosLosServicios(ordenados);
      console.log("Servicios:",soloServicios)
    } catch (error) {
      console.error("Error al cargar datos de la página:", error);
      notify.error ("Error", "Error al cargar la página");
    } finally {
      setIsLoading(false);
    }
  }

  //useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarPagina() }, []);

  // 2. ACCIONES (CREAR / EDITAR / ELIMINAR)
  const handleCrearNuevo = () => { setServicioAEditar(null); setIsSheetOpen(true); }
  
  const handleEditar = (p: ProductoDTO) => { setServicioAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
    if (servicioAEliminar) {
      try {
        await productosAPI.delete(servicioAEliminar.idProducto);
        notify.success("Eliminado", "Servicio quitado del stock");
        await cargarPagina(); // Recarga la página actual
      } catch (error) {
        console.error("Error al eliminar el servicio:", error);
        notify.error("Error", "No se pudo eliminar. El servicio tiene objetos asociados.");
      } finally {
        setIsAlertOpen(false);
        setServicioAEliminar(null);
      }
    }
  };

  const handleFormSubmit = async (data: ProductoSaveDTO) => {
    try {
      if (servicioAEditar) {
        //console.log("Update", data);
        await productosAPI.update(servicioAEditar.idProducto, data)
        notify.success("Actualizado", "Servicio actualizado correctamente.");
      } else {
        //console.log("Nuevo:", data);
        await productosAPI.create(data)
        notify.success("Registrado", "Nuevo servicio guardado.");
      }
      setIsSheetOpen(false)
      cargarPagina() // Refrescar la tabla
    } catch (error) {
      console.error("Error al guardar:", error)
      notify.error("Error", "No se pudo procesar la solicitud.")
    }
  }

  //FILTRO DE BÚSQUEDA
  const serviciosFiltrados = useMemo(() => {
      if (!searchTerm.trim()) return todosLosServicios;
      
      const query = searchTerm.toLowerCase().trim();
      return todosLosServicios.filter(p => 
        p.descripcion.toLowerCase().includes(query)
      );
    }, [searchTerm, todosLosServicios]);

    const totalPages = Math.ceil(serviciosFiltrados.length / itemsPerPage) || 1;

    const serviciosVisiblesEnPagina = useMemo(() => {
      const primerItemIndex = (currentPage - 1) * itemsPerPage;
      const ultimoItemIndex = primerItemIndex + itemsPerPage;
      return serviciosFiltrados.slice(primerItemIndex, ultimoItemIndex);
    }, [currentPage, serviciosFiltrados]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  //console.log(servicioAEliminar)

  return (
    <> {/*src/app/(protected)/layout.tsx ya contiene Navbar y div Container*/}
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Servicios" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader title="Listado de Servicios" buttonLabel="Nuevo Servicio" onButtonClick={handleCrearNuevo} />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-2 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm w-full bg-white shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Eliminarás permanentemente el servicio{" "}
            <span className="font-bold text-foreground">
              "{servicioAEliminar?.descripcion}"
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
            Eliminar Servicio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
      ) : (
        <DataTable
          caption="Lista actualizada de servicios en inventario."
          headerRow={
            <TableRow>
              {/*<TableHead className="w-[80px]">ID</TableHead>*/}
              <TableHead className={`${columnWidths.descripcion}`}>Descripción</TableHead>
              <TableHead className={`${columnWidths.categoria}`}>Categoría</TableHead>
              <TableHead className={`${columnWidths.precio} text-right`}>Precio Unit.</TableHead>
              <TableHead className={`${columnWidths.iva} text-right`}>IVA</TableHead>
              <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {serviciosVisiblesEnPagina.map((p) => (
            <TableRow key={p.idProducto}>
              {/*<TableCell className="font-medium">{p.idProducto}</TableCell>*/}
              <TableCell className={`${columnWidths.descripcion}`}>{p.descripcion}</TableCell>
              <TableCell className={`${columnWidths.categoria}`}>{p.categoria}</TableCell>
              <TableCell className={`${columnWidths.precio} text-right`}>{formatGuaranies(p.precioUnitario)}</TableCell>
              <TableCell className={`${columnWidths.precio} text-right`}>{`${p.porcentajeIva}%`}</TableCell>
              <TableCell className={`${columnWidths.acciones} text-right space-x-1`}>
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {setServicioAEliminar(p); setIsAlertOpen(true);}} className="cursor-pointer">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {todosLosServicios.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                No hay servicios para mostrar.
              </TableCell>
            </TableRow>
          )}
          {todosLosServicios.length !== 0 && serviciosVisiblesEnPagina.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                No hay servicios que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </DataTable>
      )}
      {/*SHEET LATERAL*/}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="px-6 sm:max-w-[540px] sm:min-w-[450px]">
          <SheetHeader className="border-b pt-4">
            <SheetTitle>{servicioAEditar ? "Editar Servicio" : "Nuevo Servicio"}</SheetTitle>
            <SheetDescription>Completa la información del formulario.</SheetDescription>
          </SheetHeader>
          <ServicioForm
            key={servicioAEditar?.idProducto ?? "nuevo"}
            servicioEditado={servicioAEditar}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}