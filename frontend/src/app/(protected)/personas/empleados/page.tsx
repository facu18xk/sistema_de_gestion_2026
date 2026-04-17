"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
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

const empleadosIniciales: Empleado[] = [
  { id: "E001", nombre: "Roberto", apellido: "Gimenez", ciRuc: "3333333-3", fechaIngreso: "2026-01-10", salario: "3000000", cargo: "Vendedor" },
  { id: "E002", nombre: "Ana", apellido: "Gonzalez", ciRuc: "4444444-4", fechaIngreso: "2026-01-10", salario: "3000000", cargo: "Vendedor" },
]

export default function EmpleadosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null)

  const handleCrearNuevo = () => {
    setEmpleadoAEditar(null)
    setIsSheetOpen(true)
  }

  const handleEditar = (empleado: Empleado) => {
    setEmpleadoAEditar(empleado)
    setIsSheetOpen(true)
  }

  const handleFormSubmit = (data: Empleado) => {
    console.log(empleadoAEditar ? "Actualizando:" : "Creando:", data)
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
            <BreadcrumbItem><BreadcrumbLink href="#">RRHH</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Empleados</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Listado de Empleados</h1>
          <Button onClick={handleCrearNuevo} className="gap-2 cursor-pointer">
            <Plus className="size-4" /> Nuevo Empleado
          </Button>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableCaption>Lista actualizada de empleados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>CI/RUC</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead>Salario</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleadosIniciales.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell className="font-medium">{empleado.id}</TableCell>
                  <TableCell className="font-semibold">{empleado.nombre} {empleado.apellido}</TableCell>
                  <TableCell>{empleado.ciRuc}</TableCell>
                  <TableCell>{empleado.fechaIngreso}</TableCell>
                  <TableCell>Gs. {parseInt(empleado.salario).toLocaleString()}</TableCell>
                  <TableCell>{empleado.cargo}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(empleado)} className="cursor-pointer">
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
              <SheetTitle>{empleadoAEditar ? "Editar Empleado" : "Nuevo Empleado"}</SheetTitle>
              <SheetDescription>Completa la información del empleado.</SheetDescription>
            </SheetHeader>

            <EmpleadoForm
              key={empleadoAEditar?.id || "nuevo-empleado"}
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