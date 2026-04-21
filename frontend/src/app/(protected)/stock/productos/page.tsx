"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
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

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState<ProductoDTO | null>(null)
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoDTO | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const [resProductos, resMarcas, resCategorias] = await Promise.all([
        productosAPI.getAll(),
        marcasAPI.getAll(),
        categoriasAPI.getAll()
      ])
      setProductos(resProductos)
      setMarcas(resMarcas)
      setCategorias(resCategorias)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarPagina() }, [])

  // 2. ACCIONES (CREAR / EDITAR / ELIMINAR)
  const handleCrearNuevo = () => { setProductoAEditar(null); setIsSheetOpen(true); }
  
  const handleEditar = (p: ProductoDTO) => { setProductoAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
    if (productoAEliminar) {
      try {
        await productosAPI.delete(productoAEliminar.idProducto);
        await cargarPagina();
      } catch (error) {
        console.error("Error al eliminar", error);
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
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
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
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {setProductoAEliminar(p); setIsAlertOpen(true);}} className="cursor-pointer">
                    <Trash2 className="size-4 text-destructive" />
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
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}