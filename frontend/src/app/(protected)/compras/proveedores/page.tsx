"use client"

import Navbar from "@/components/navbar"
import { useState } from "react"
import { Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProveedorForm } from "@/components/compras/proveedor-form"
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

// Datos de Proveedores
const proveedores = [
  {
    id: "PR001",
    razonSocial: "Tires S.A.",
    nombreFantasia: "Tires",
    ruc: "80012345-6",
    direccion: "Asunción",
  },
  {
    id: "PR002",
    razonSocial: "Kempf S.R.L.",
    nombreFantasia: "Kempf Tires",
    ruc: "80067891-8",
    direccion: "Hohenau",
  },
]

export default function ProveedoresPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [proveedorAEditar, setProveedorAEditar] = useState<any>(null)

    const handleCrearNuevo = () => {
      setProveedorAEditar(null) // Limpiamos para que sea "Crear"
      setIsSheetOpen(true)
    }

    const handleEditar = (producto: any) => {
      setProveedorAEditar(producto) // Pasamos los datos para que sea "Editar"
      setIsSheetOpen(true)
    }

    const handleFormSubmit = (data: any) => {
      if (proveedorAEditar) {
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
          
          {/* BREADCRUMB */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Compras</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Proveedores</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
    
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Listado de Proveedores</h1>
            <div className="flex justify-between items-center">
              <Button onClick={handleCrearNuevo} className="gap-2 cursor-pointer">
                <Plus className="size-4" /> Nuevo Proveedor
              </Button>
            </div>
          </div>
    
          {/* TABLA DE PRODUCTOS */}
          <div className="rounded-md border bg-white">
            <Table>
              <TableCaption>Lista actualizada de proveedores.</TableCaption>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>Nombre Fantasía</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead>Dirección</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedores.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                    <TableCell className="font-medium">{proveedor.id}</TableCell>
                    <TableCell className="font-semibold">{proveedor.razonSocial}</TableCell>
                    <TableCell>{proveedor.nombreFantasia}</TableCell>
                    <TableCell>{proveedor.ruc}</TableCell>
                    <TableCell>{proveedor.direccion}</TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(proveedor)}>
                      <Pencil className="size-4" />
                    </Button>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* EL ÚNICO SHEET PARA AMBAS ACCIONES */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="px-6 sm:max-w-[540px]">
              <SheetHeader>
                <SheetTitle>
                  {proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}
                </SheetTitle>
                <SheetDescription>
                  Completa la información del inventario.
                </SheetDescription>
              </SheetHeader>
              
              <ProveedorForm 
                proveedorEditado={proveedorAEditar} 
                onSubmit={handleFormSubmit}
                onCancel={() => setIsSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
  )
}