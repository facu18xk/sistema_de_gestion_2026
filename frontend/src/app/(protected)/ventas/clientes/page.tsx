"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClienteForm, Cliente } from "@/components/ventas/clientes-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"

const clientesIniciales: Cliente[] = [
  { id: "CL001", nombre: "Juan", apellido: "Pérez", ciRuc: "5454544", direccion: "Encarnación", email: "juan@gmail.com", telefono: "0981 111111" },
  { id: "CL002", nombre: "María", apellido: "Gómez", ciRuc: "5123456", direccion: "Asunción", email: "maria@gmail.com", telefono: "0982 222222" },
]

export default function ClientesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null)

  const handleCrearNuevo = () => { setClienteAEditar(null); setIsSheetOpen(true); }
  const handleEditar = (c: Cliente) => { setClienteAEditar(c); setIsSheetOpen(true); }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Clientes" }]} />
        <PageHeader title="Listado de Clientes" buttonLabel="Nuevo Cliente" onButtonClick={handleCrearNuevo} />

        <DataTable
          caption="Lista actualizada de clientes registrados."
          headerRow={
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>CI/RUC</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {clientesIniciales.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.id}</TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">{c.nombre} {c.apellido}</span>
                  <span className="text-xs text-muted-foreground">{c.email}</span>
                </div>
              </TableCell>
              <TableCell>{c.ciRuc}</TableCell>
              <TableCell>{c.direccion}</TableCell>
              <TableCell>{c.telefono}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(c)} className="cursor-pointer">
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
              <SheetTitle>{clienteAEditar ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
              <SheetDescription>Completa los datos de contacto del cliente.</SheetDescription>
            </SheetHeader>
            <ClienteForm
              key={clienteAEditar?.id || "nuevo"}
              clienteEditado={clienteAEditar}
              onSubmit={() => setIsSheetOpen(false)}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}