"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductoForm, Producto } from "@/components/stock/producto-form"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Datos de prueba iniciales
const productosIniciales: Producto[] = [
  { id: "P001", descripcion: "Neumático Deportivo", marca: "McQueen", categoria: "Pista", precio: 120.50, cantidad: 45 },
  { id: "P002", descripcion: "Llanta Aleación", marca: "Tires Co", categoria: "Accesorios", precio: 85.00, cantidad: 12 },
]

export default function ProductosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null)

  const [categorias, setCategorias] = useState<string[]>([])
  const [marcas, setMarcas] = useState<string[]>([])

  useEffect(() => {
    const fetchFormData = async () => {
      // Simulación de API
      setCategorias(["Pista", "Accesorios", "Mantenimiento", "Urbano"])
      setMarcas(["McQueen", "Tires Co", "QuickFix", "Michelin", "Bridgestone"])
    }
    fetchFormData()
  }, [])

  const handleCrearNuevo = () => {
    setProductoAEditar(null)
    setIsSheetOpen(true)
  }

  const handleEditar = (producto: Producto) => {
    setProductoAEditar(producto)
    setIsSheetOpen(true)
  }

  const handleFormSubmit = (data: Producto) => {
    if (productoAEditar) {
      console.log("Actualizando en DB:", data)
    } else {
      console.log("Creando en DB:", data)
    }
    setIsSheetOpen(false)
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Stock</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Productos</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Listado de Productos</h1>
          <Button onClick={handleCrearNuevo} className="cursor-pointer gap-2">
            <Plus className="size-4" /> Nuevo Producto
          </Button>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableCaption>Lista actualizada de productos en inventario.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosIniciales.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.id}</TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell>{producto.marca}</TableCell>
                  <TableCell>{producto.categoria}</TableCell>
                  <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">{producto.cantidad}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(producto)} className="cursor-pointer">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
              <SheetDescription>Completa la información del inventario.</SheetDescription>
            </SheetHeader>

            {/* En app/stock/productos/page.tsx */}
            <ProductoForm

              key={productoAEditar?.id || "nuevo-producto"}
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