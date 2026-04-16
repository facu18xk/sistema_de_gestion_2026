"use client"

import Navbar from "@/components/navbar"
import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmpleadoForm, Empleado } from "@/components/personas/empleados-form"
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

// Datos de Clientes
const empleados: Empleado[] = [
  {
    id: "E001",
    nombre: "Roberto",
    apellido: "Gimenez",
    ciRuc: "3333333-3",
    fechaIngreso: "2026-01-10",
    salario: "3000000",
    cargo: "Vendedor",
  },
  {
    id: "E002",
    nombre: "Ana",
    apellido: "Gonzalez",
    ciRuc: "4444444-4",
    fechaIngreso: "2026-01-10",
    salario: "3000000",
    cargo: "Vendedor",
  },
]

export default function EmpleadosPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [empleadoAEditar, setEmpleadoAEditar] = useState<any>(null)

    const handleCrearNuevo = () => {
      setEmpleadoAEditar(null) // Limpiamos para que sea "Crear"
      setIsSheetOpen(true)
    }

    const handleEditar = (empleado: Empleado) => {
      setEmpleadoAEditar(empleado) // Pasamos los datos para que sea "Editar"
      setIsSheetOpen(true)
    }

    const handleFormSubmit = (data: Empleado) => {
      if (empleadoAEditar) {
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
                <BreadcrumbLink href="#">RRHH</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Empleados</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
    
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Listado de Empleados</h1>
            <div className="flex justify-between items-center">
              <Button onClick={handleCrearNuevo} className="gap-2 cursor-pointer">
                <Plus className="size-4" /> Nuevo Empleado
              </Button>
            </div>
          </div>
    
          {/* TABLA DE Empleados */}
          <div className="rounded-md border bg-white">
            <Table>
              <TableCaption>Lista actualizada de empleados.</TableCaption>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>CI/RUC</TableHead>
                    <TableHead>Fecha de Ingreso</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empleados.map((empleado) => (
                    <TableRow key={empleado.id}>
                        <TableCell className="font-medium">{empleado.id}</TableCell>
                        <TableCell className="font-semibold">{empleado.nombre}</TableCell>
                        <TableCell>{empleado.apellido}</TableCell>
                        <TableCell>{empleado.ciRuc}</TableCell>
                        <TableCell>{empleado.fechaIngreso}</TableCell>
                        <TableCell>{empleado.salario}</TableCell>
                        <TableCell>{empleado.cargo}</TableCell>
                        <TableCell className="text-right">
                            <Button className="cursor-pointer hover:bg-slate-300" variant="ghost" size="icon" onClick={() => handleEditar(empleado)}>
                                <Pencil className="size-4" />
                            </Button>
                            <Button className="cursor-pointer hover:bg-slate-300" variant="ghost" size="icon">
                                <Trash2 className="size-4" />
                            </Button>
                    </TableCell>
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
                  {empleadoAEditar ? "Editar Empleado" : "Nuevo Empleado"}
                </SheetTitle>
                <SheetDescription>
                  Completa la información del empleado.
                </SheetDescription>
              </SheetHeader>
              
              <EmpleadoForm 
                empleadoEditado={empleadoAEditar} 
                onSubmit={handleFormSubmit}
                onCancel={() => setIsSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
  )
}