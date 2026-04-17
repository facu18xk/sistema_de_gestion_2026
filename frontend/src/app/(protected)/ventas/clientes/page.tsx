"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClienteForm, Cliente } from "@/components/ventas/clientes-form"
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

const clientesIniciales: Cliente[] = [
  { id: "CL001", nombre: "Juan", apellido: "Pérez", ciRuc: "5454544", direccion: "Encarnación", email: "juan@gmail.com", telefono: "0981 111111" },
  { id: "CL002", nombre: "María", apellido: "Gómez", ciRuc: "5123456", direccion: "Asunción", email: "maria@gmail.com", telefono: "0982 222222" },
]

export default function ClientesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null)

  const handleCrearNuevo = () => {
    setClienteAEditar(null)
    setIsSheetOpen(true)
  }

  const handleEditar = (cliente: Cliente) => {
    setClienteAEditar(cliente)
    setIsSheetOpen(true)
  }

  const handleFormSubmit = (data: Cliente) => {
    console.log(clienteAEditar ? "Actualizando:" : "Creando:", data)
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
            <BreadcrumbItem><BreadcrumbLink href="#">Ventas</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Clientes</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Listado de Clientes</h1>
          <Button onClick={handleCrearNuevo} className="gap-2 cursor-pointer">
            <Plus className="size-4" /> Nuevo Cliente
          </Button>
        </div>

        <div className="rounded-md border bg-white">
          <Table>
            <TableCaption>Lista actualizada de clientes registrados.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>CI/RUC</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesIniciales.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{cliente.nombre} {cliente.apellido}</span>
                      <span className="text-xs text-muted-foreground">{cliente.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{cliente.ciRuc}</TableCell>
                  <TableCell>{cliente.direccion}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(cliente)} className="cursor-pointer">
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
              <SheetTitle>{clienteAEditar ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
              <SheetDescription>Completa los datos fiscales y de contacto.</SheetDescription>
            </SheetHeader>

            <ClienteForm
              key={clienteAEditar?.id || "nuevo-cliente"}
              clienteEditado={clienteAEditar}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}