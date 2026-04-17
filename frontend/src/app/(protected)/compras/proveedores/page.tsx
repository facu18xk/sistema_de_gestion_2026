"use client"

import React, { useState } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProveedorForm, Proveedor } from "@/components/compras/proveedor-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"

const proveedoresIniciales: Proveedor[] = [
  {
    id: "PR001",
    nombreFantasia: "McQueen Tires",
    razonSocial: "Distribuidora McQueen S.A.",
    ruc: "80011223-4",
    direccion: "Fernando de la Mora",
    telefono: "021 123 456",
    email: "info@mcqueen.com",
    contactoNombre: "Sr. Rayo"
  },
]

export default function ProveedoresPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null)

  const handleCrearNuevo = () => { setProveedorAEditar(null); setIsSheetOpen(true); }
  const handleEditar = (p: Proveedor) => { setProveedorAEditar(p); setIsSheetOpen(true); }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Proveedores" }]} />
        <PageHeader title="Listado de Proveedores" buttonLabel="Nuevo Proveedor" onButtonClick={handleCrearNuevo} />

        <DataTable
          caption="Lista de proveedores y distribuidores."
          headerRow={
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nombre Fantasía</TableHead>
              <TableHead>Razón Social</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Dirección / Tel.</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {proveedoresIniciales.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-slate-500">{p.id}</TableCell>
              <TableCell className="font-bold text-slate-900">{p.nombreFantasia}</TableCell>
              <TableCell>{p.razonSocial}</TableCell>
              <TableCell className="font-mono text-sm">{p.ruc}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{p.contactoNombre}</span>
                  <span className="text-xs text-muted-foreground">{p.email}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <div className="flex flex-col">
                  <span>{p.direccion}</span>
                  <span className="text-xs text-slate-500">{p.telefono}</span>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="cursor-pointer text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>{proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}</SheetTitle>
              <SheetDescription>Información comercial y fiscal del proveedor.</SheetDescription>
            </SheetHeader>
            <ProveedorForm
              key={proveedorAEditar?.id || "nuevo"}
              proveedorEditado={proveedorAEditar}
              onSubmit={() => setIsSheetOpen(false)}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}