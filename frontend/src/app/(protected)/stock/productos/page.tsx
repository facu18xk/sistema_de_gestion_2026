"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductoForm, Producto } from "@/components/stock/producto-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"

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
    setCategorias(["Pista", "Accesorios", "Mantenimiento", "Urbano"])
    setMarcas(["McQueen", "Tires Co", "QuickFix", "Michelin", "Bridgestone"])
  }, [])

  const handleCrearNuevo = () => { setProductoAEditar(null); setIsSheetOpen(true); }
  const handleEditar = (p: Producto) => { setProductoAEditar(p); setIsSheetOpen(true); }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Productos" }]} />
        <PageHeader title="Listado de Productos" buttonLabel="Nuevo Producto" onButtonClick={handleCrearNuevo} />

        <DataTable
          caption="Lista actualizada de productos en inventario."
          headerRow={
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio Unit.</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {productosIniciales.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.id}</TableCell>
              <TableCell>{p.descripcion}</TableCell>
              <TableCell>{p.marca}</TableCell>
              <TableCell>{p.categoria}</TableCell>
              <TableCell className="text-right">${p.precio.toFixed(2)}</TableCell>
              <TableCell className="text-right font-semibold">{p.cantidad}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
              <SheetDescription>Completa la información del inventario.</SheetDescription>
            </SheetHeader>
            <ProductoForm
              key={productoAEditar?.id || "nuevo"}
              productoEditado={productoAEditar}
              categorias={categorias} marcas={marcas}
              onSubmit={() => setIsSheetOpen(false)}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}