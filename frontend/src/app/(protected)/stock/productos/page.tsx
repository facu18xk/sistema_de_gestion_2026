"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductoForm } from "@/components/stock/producto-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"

import { productosAPI } from "@/services/productosAPI"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ProductoDTO, ProductoSaveDTO, Marca, Categoria } from "@/types/types"

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState<ProductoDTO | null>(null)
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
      console.log(resProductos)
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

  const handleEliminar = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await productosAPI.delete(id)
        await cargarPagina() // Refrescar lista
      } catch (error) {
        alert("Error al eliminar")
      }
    }
  }

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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Productos" }]} />
        <PageHeader title="Listado de Productos" buttonLabel="Nuevo Producto" onButtonClick={handleCrearNuevo} />

        {isLoading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <DataTable
            caption="Lista actualizada de productos en inventario."
            headerRow={
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
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
                <TableCell className="font-medium">{p.idProducto}</TableCell>
                <TableCell>{p.descripcion}</TableCell>
                <TableCell>{p.marca}</TableCell>
                <TableCell>{p.categoria}</TableCell>
                <TableCell className="text-right">${p.precioUnitario.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">{p.cantidadTotal}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEliminar(p.idProducto)} className="cursor-pointer">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[540px]">
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