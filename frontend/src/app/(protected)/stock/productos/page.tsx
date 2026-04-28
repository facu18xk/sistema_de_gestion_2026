"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductoForm } from "@/components/stock/producto-form"
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

import { productosAPI } from "@/services/productosAPI"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ProductoDTO, ProductoSaveDTO, Marca, Categoria } from "@/types/types"
import { formatGuaranies } from "@/utils/money-format"
import { notify } from "@/lib/notifications"

export default function ProductosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productos, setProductos] = useState<ProductoDTO[]>([])
  const [productoAEditar, setProductoAEditar] = useState<ProductoDTO | null>(null)
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoDTO | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10) //10 por defecto

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resPaginada, resMarcas, resCategorias] = await Promise.all([
        productosAPI.getAll(currentPage, itemsPerPage),
        marcasAPI.getAll(),
        categoriasAPI.getAll()
      ])
      setProductos(resPaginada.items);
      setTotalPages(resPaginada.totalPages);
      setMarcas(resMarcas.items);
      setCategorias(resCategorias.items);
    } catch (error) {
      console.error("Error al cargar datos de la página:", error);
      notify.error ("Error", "Error al cargar la página");
    } finally {
      setIsLoading(false);
    }
  }

  const cargarMarcas = async () => {
    try {
      const response = await marcasAPI.getAll();
      setMarcas(response.items);
    } catch (error) {
      console.error("Error al cargar datos de marcas:", error);
      notify.error ("Error", "Error al cargar las marcas");
    }
  }

  const cargarCategorias = async () => {
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response.items);
    } catch (error) {
      console.error("Error al cargar datos de categorías:", error);
      notify.error ("Error", "Error al cargar las categorías");
    }
  }

  useEffect(() => { cargarPagina() }, [currentPage]);

  // 2. ACCIONES (CREAR / EDITAR / ELIMINAR)
  const handleCrearNuevo = () => { setProductoAEditar(null); setIsSheetOpen(true); }
  
  const handleEditar = (p: ProductoDTO) => { setProductoAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
    if (productoAEliminar) {
      try {
        await productosAPI.delete(productoAEliminar.idProducto);
        notify.success("Eliminado", "Producto quitado del stock");
        await cargarPagina(); // Recarga la página actual
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        notify.error("Error", "No se pudo eliminar");
      } finally {
        setIsAlertOpen(false);
        setProductoAEliminar(null);
      }
    }
  };

  const handleFormSubmit = async (data: ProductoSaveDTO) => {
    try {
      if (productoAEditar) {
        //console.log(data);
        await productosAPI.update(productoAEditar.idProducto, data)
      } else {
        //console.log(data);
        await productosAPI.create(data)
      }
      setIsSheetOpen(false)
      cargarPagina() // Refrescar la tabla
    } catch (error) {
      console.error("Error al guardar:", error)
    }
  }

  //console.log(productoAEliminar)

  return (
    <> {/*src/app/(protected)/layout.tsx ya contiene Navbar y div Container*/}
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Productos" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader title="Listado de Productos" buttonLabel="Nuevo Producto" onButtonClick={handleCrearNuevo} />
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Eliminarás permanentemente el producto{" "}
            <span className="font-bold text-foreground">
              "{productoAEliminar?.descripcion}"
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
            Eliminar Producto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
      ) : (
        <DataTable
          caption="Lista actualizada de productos en inventario."
          headerRow={
            <TableRow>
              {/*<TableHead className="w-[80px]">ID</TableHead>*/}
              <TableHead>Descripción</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Stock Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {productos.map((p) => (
            <TableRow key={p.idProducto}>
              {/*<TableCell className="font-medium">{p.idProducto}</TableCell>*/}
              <TableCell>{p.descripcion}</TableCell>
              <TableCell>{p.marca}</TableCell>
              <TableCell>{p.categoria}</TableCell>
              <TableCell className="text-right">{formatGuaranies(p.precioUnitario)}</TableCell>
              <TableCell className="text-right font-semibold">{p.cantidadTotal}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {setProductoAEliminar(p); setIsAlertOpen(true);}} className="cursor-pointer">
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
            <SheetTitle>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
            <SheetDescription>Completa la información del inventario.</SheetDescription>
          </SheetHeader>
          <ProductoForm
            key={productoAEditar?.idProducto ?? "nuevo"}
            productoEditado={productoAEditar}
            categorias={categorias} 
            marcas={marcas}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
            onRefreshData={async () => {
              await cargarMarcas();
              await cargarCategorias();
           }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}