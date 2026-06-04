"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { notasDevolucionesCompraAPI } from "@/services/notasDevolucionesCompraAPI"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { notify } from "@/lib/notifications"
import { Loader2 } from "lucide-react"

interface DetalleUI {
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: { descripcion: string };
}

export default function EditarNotaDevolucionPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const isReadOnlyParams = searchParams?.get("readOnly") === "true"
  const isFromCredito = searchParams?.get("source") === "credito"

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(isReadOnlyParams)

  // Estado de la Cabecera
  const [formData, setFormData] = useState({
    idFacturaCompra: "",
    fecha: "",
    motivo: "",
    estado: "",
  })

  // Estado de los Detalles (Productos a devolver)
  const [detalles, setDetalles] = useState<DetalleUI[]>([])

  useEffect(() => {
    const cargarNota = async () => {
      if (!params?.id || isNaN(Number(params.id))) return

      try {
        const id = Number(params.id)
        const data = await notasDevolucionesCompraAPI.getById(id)

        setFormData({
          idFacturaCompra: data.idFacturaCompra?.toString() || "",
          fecha: data.fecha ? data.fecha.substring(0, 10) : "",
          motivo: data.motivo || "",
          estado: data.estado || "",
        })

        if (data.detalles && data.detalles.length > 0) {
          try {
             const factura = await FacturasCompraAPI.getById(Number(data.idFacturaCompra));
             const detallesMapeados: DetalleUI[] = data.detalles.map((det: any) => {
                const prodFactura = factura.detalles?.find(fd => fd.idProducto === det.idProducto);
                return {
                    idProducto: det.idProducto,
                    cantidad: det.cantidad || (det.precioUnitario ? Math.round(det.subtotal / det.precioUnitario) : 0),
                    precioUnitario: det.precioUnitario,
                    subtotal: det.subtotal,
                    producto: {
                        descripcion: det.producto?.descripcion || prodFactura?.producto?.descripcion || "Producto " + det.idProducto
                    }
                }
             });
             setDetalles(detallesMapeados);
          } catch (err) {
             console.error("Error fetching FacturaCompra details to map description", err);
             const fallbackDetalles: DetalleUI[] = data.detalles.map((det: any) => ({
                idProducto: det.idProducto,
                cantidad: det.cantidad || (det.precioUnitario ? Math.round(det.subtotal / det.precioUnitario) : 0),
                precioUnitario: det.precioUnitario,
                subtotal: det.subtotal,
                producto: det.producto || { descripcion: "Producto " + det.idProducto }
             }));
             setDetalles(fallbackDetalles);
          }
        } else {
            setDetalles([])
        }

        // Si la nota no está Pendiente, forzar solo lectura
        if (data.estado !== "Pendiente") {
            setIsReadOnly(true)
        }
      } catch (error) {
        console.error("Error al cargar la nota de devolución:", error)
        notify.error("Error de carga", "No se pudo recuperar la información de la nota.")
      } finally {
        setIsLoading(false)
      }
    }

    cargarNota()
  }, [params?.id])

  const updateCabecera = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calcularTotal = () => {
    return detalles.reduce((acc, det) => acc + ((det.cantidad || 0) * (det.precioUnitario || 0)), 0)
  }

  const handleSubmit = async () => {
    if (isReadOnly) {
      router.push(isFromCredito ? "/compras/notas-de-credito" : "/compras/notas-de-devolucion")
      return
    }

    setIsSubmitting(true)
    try {
      const id = Number(params?.id)
      
      const payload = {
        idFacturaCompra: Number(formData.idFacturaCompra),
        idEstado: formData.estado === "Pendiente" ? 1 : (formData.estado === "Aprobado" ? 2 : 3), 
        fecha: new Date(formData.fecha).toISOString(),
        motivo: formData.motivo,
        detalles: detalles.map(d => ({
          idProducto: Number(d.idProducto),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subtotal: Number(d.cantidad) * Number(d.precioUnitario)
        }))
      }

      await notasDevolucionesCompraAPI.update(id, payload)
      notify.success("Éxito", "Nota de devolución actualizada correctamente.")
      router.push("/compras/notas-de-devolucion")
    } catch (error) {
      console.error(error)
      notify.error("Error", "Ocurrió un problema al actualizar la nota de devolución.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary size-10" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageBreadcrumb 
        steps={[
          { label: "Compras", href: "/compras" },
          { label: "Notas de Devolución", href: "/compras/notas-de-devolucion" },
          { label: isReadOnly ? "Inspeccionar" : "Editar" }
        ]} 
      />

      <FormContainer
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        onCancel={() => router.push(isFromCredito ? "/compras/notas-de-credito" : "/compras/notas-de-devolucion")}
        isEditing={!isReadOnly}
        submitText={{ save: "Aceptar", update: isSubmitting ? "Guardando..." : "Guardar Cambios" }}
        submitDisabled={isSubmitting}
      >
        <div className="border-b pb-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Datos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldWrapper id="idFacturaCompra" label="ID Factura Origen">
              <Input
                id="idFacturaCompra"
                type="number"
                value={formData.idFacturaCompra}
                disabled // Siempre disabled en edición
              />
            </FieldWrapper>

            <FieldWrapper id="fecha" label="Fecha de Devolución">
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => updateCabecera("fecha", e.target.value)}
                disabled={isReadOnly}
                required
              />
            </FieldWrapper>

            <div className="md:col-span-2">
              <FieldWrapper id="motivo" label="Motivo de la Devolución">
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => updateCabecera("motivo", e.target.value)}
                  placeholder="Ej: Productos defectuosos..."
                  disabled={isReadOnly}
                  required
                />
              </FieldWrapper>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{isFromCredito ? "Productos Devueltos" : "Productos a Devolver"}</h3>
            {!isFromCredito && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                Para cambiar productos, debe anular/eliminar y crear una nueva nota.
              </span>
            )}
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-32">Cantidad</TableHead>
                  <TableHead className="w-48">Precio Unitario</TableHead>
                  <TableHead className="w-32 text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No hay productos asociados a esta nota.
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((det, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="text"
                          value={det.producto?.descripcion || det.idProducto}
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={det.cantidad}
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={det.precioUnitario}
                          disabled
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Gs. {((det.cantidad || 0) * (det.precioUnitario || 0)).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="text-lg font-bold">
              Total a Devolver: Gs. {calcularTotal().toLocaleString()}
            </div>
          </div>
        </div>
      </FormContainer>
    </div>
  )
}
