"use client"
import { Proveedor, Pais } from "@/types/types" // 1. Añadimos Pais a los tipos
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProveedorForm } from "@/components/compras/proveedor-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI" // 2. Importamos el nuevo servicio

export default function ProveedoresPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [paises, setPaises] = useState<Pais[]>([]) // 3. Estado para países
  const [loading, setLoading] = useState(true)

  // --- LLAMADAS A API ---

  const fetchProveedores = async () => {
    try {
      setLoading(true)
      const data = await proveedoresAPI.getAll()
      setProveedores(data)
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
    } finally {
      setLoading(false)
    }
  }

  // 4. Nueva función para cargar países
  const fetchPaises = async () => {
    try {
      const data = await ubicacionesAPI.getPaises()
      setPaises(data)
    } catch (error) {
      console.error("Error al cargar países:", error)
    }
  }

  const handleSave = async (data: Proveedor) => {
    try {
      if (proveedorAEditar?.idProveedor) {
        await proveedoresAPI.update(proveedorAEditar.idProveedor, data)
      } else {
        await proveedoresAPI.create(data)
      }
      setIsSheetOpen(false)
      fetchProveedores()
    } catch (error) {
      console.error("Error al guardar el proveedor:", error)
      alert("Ocurrió un error al procesar la solicitud.")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proveedor?")) return
    try {
      await proveedoresAPI.delete(id)
      fetchProveedores()
    } catch (error) {
      console.error("Error al eliminar el proveedor:", error)
    }
  }

  useEffect(() => {
    fetchProveedores()
    fetchPaises() // 5. Cargamos países al iniciar la página
  }, [])

  const handleCrearNuevo = () => {
    setProveedorAEditar(null)
    setIsSheetOpen(true)
  }

  const handleEditar = (p: Proveedor) => {
    setProveedorAEditar(p)
    setIsSheetOpen(true)
  }

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
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {loading ? (
            <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
          ) : (
            proveedores.map((p) => (
              <TableRow key={p.idProveedor}>
                <TableCell className="font-medium text-slate-500">{p.idProveedor}</TableCell>
                <TableCell className="font-bold text-slate-900">{p.nombreFantasia}</TableCell>
                <TableCell>{p.razonSocial}</TableCell>
                <TableCell className="font-mono text-sm">{p.ruc}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{p.nombres} {p.apellidos}</span>
                    <span className="text-xs text-muted-foreground">{p.correo}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{p.telefono}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => p.idProveedor && handleDelete(p.idProveedor)}
                    className="cursor-pointer text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </DataTable>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="px-6 sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>{proveedorAEditar ? "Editar Proveedor" : "Nuevo Proveedor"}</SheetTitle>
              <SheetDescription>Información comercial y fiscal del proveedor.</SheetDescription>
            </SheetHeader>
            <ProveedorForm
              key={proveedorAEditar?.idProveedor || "nuevo"}
              proveedorEditado={proveedorAEditar}
              paises={paises}
              onSubmit={handleSave}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}