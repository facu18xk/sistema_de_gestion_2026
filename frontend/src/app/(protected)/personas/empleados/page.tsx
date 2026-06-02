"use client"

import React, { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmpleadoForm, Empleado } from "@/components/personas/empleados-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"

const empleadosIniciales: Empleado[] = [
  { id: "E001", nombre: "Roberto", apellido: "Gimenez", ciRuc: "3333333-3", fechaIngreso: "2026-01-10", salario: "3000000", cargo: "Vendedor" },
  { id: "E002", nombre: "Ana", apellido: "Gonzalez", ciRuc: "4444444-4", fechaIngreso: "2026-01-10", salario: "3000000", cargo: "Vendedor" },
]

export default function EmpleadosPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null)
  const [listaCargos, setListaCargos] = useState<string[]>(["Vendedor", "Administrador", "Cajero", "Mecánico"])

  const handleCrearNuevo = () => { setEmpleadoAEditar(null); setIsSheetOpen(true); }
  const handleEditar = (e: Empleado) => { setEmpleadoAEditar(e); setIsSheetOpen(true); }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "RRHH", href: "#" }, { label: "Empleados" }]} />
        <PageHeader title="Listado de Empleados" buttonLabel="Nuevo Empleado" onButtonClick={handleCrearNuevo} />

        <DataTable
          caption="Lista actualizada de empleados."
          headerRow={
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>CI/RUC</TableHead>
              <TableHead>Fecha Ingreso</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {empleadosIniciales.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">{e.id}</TableCell>
              <TableCell className="font-semibold">{e.nombre} {e.apellido}</TableCell>
              <TableCell>{e.ciRuc}</TableCell>
              <TableCell>{e.fechaIngreso}</TableCell>
              <TableCell>Gs. {parseInt(e.salario).toLocaleString()}</TableCell>
              <TableCell>{e.cargo}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(e)} className="cursor-pointer">
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
              <SheetTitle>{empleadoAEditar ? "Editar Empleado" : "Nuevo Empleado"}</SheetTitle>
              <SheetDescription>Completa la información del personal.</SheetDescription>
            </SheetHeader>
            <EmpleadoForm
              key={empleadoAEditar?.id || "nuevo"}
              empleadoEditado={empleadoAEditar} cargos={listaCargos}
              onSubmit={() => setIsSheetOpen(false)}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}