"use client"

import Navbar from "@/components/navbar"
import { useState } from "react"
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

// Datos de Clientes
const clientes: Cliente[] = [
  {
    id: "CL001",
    nombre: "Juan",
    apellido: "Pérez",
    ciRuc: "5454544",
    direccion: "Encarnación",
    email: "juan@gmail.com",
    telefono: "0981 111111",
  },
  {
    id: "CL002",
    nombre: "María",
    apellido: "Gómez",
    ciRuc: "5123456",
    direccion: "Asunción",
    email: "maria@gmail.com",
    telefono: "0982 222222",
  },
]

export default function ClientesPage() {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [clienteAEditar, setClienteAEditar] = useState<any>(null)

    const handleCrearNuevo = () => {
      setClienteAEditar(null) // Limpiamos para que sea "Crear"
      setIsSheetOpen(true)
    }

    const handleEditar = (cliente: Cliente) => {
      setClienteAEditar(cliente) // Pasamos los datos para que sea "Editar"
      setIsSheetOpen(true)
    }

    const handleFormSubmit = (data: Cliente) => {
      if (clienteAEditar) {
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
                <BreadcrumbLink href="#">Ventas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Clientes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
    
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Listado de Clientes</h1>
            <div className="flex justify-between items-center">
              <Button onClick={handleCrearNuevo} className="gap-2 cursor-pointer">
                <Plus className="size-4" /> Nuevo Cliente
              </Button>
            </div>
          </div>
    
          {/* TABLA DE CLIENTES */}
          <div className="rounded-md border bg-white">
            <Table>
              <TableCaption>Lista actualizada de clientes.</TableCaption>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>CI/RUC</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.id}</TableCell>
                        <TableCell className="font-semibold">{cliente.nombre}</TableCell>
                        <TableCell>{cliente.apellido}</TableCell>
                        <TableCell>{cliente.ciRuc}</TableCell>
                        <TableCell>{cliente.direccion}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.telefono}</TableCell>
                        <TableCell className="text-right">
                            <Button className="cursor-pointer hover:bg-slate-300" variant="ghost" size="icon" onClick={() => handleEditar(cliente)}>
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
                  {clienteAEditar ? "Editar Cliente" : "Nuevo Cliente"}
                </SheetTitle>
                <SheetDescription>
                  Completa la información del cliente.
                </SheetDescription>
              </SheetHeader>
              
              <ClienteForm 
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