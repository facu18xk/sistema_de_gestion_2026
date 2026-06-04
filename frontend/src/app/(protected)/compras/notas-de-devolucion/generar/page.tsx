"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { notasDevolucionesCompraAPI } from "@/services/notasDevolucionesCompraAPI"
import { notify } from "@/lib/notifications"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { FacturaCompra, FacturaCompraDetalle, NotaDevolucionCompraSaveDTO } from "@/types/types"
import { SearchableSelect } from "@/components/searchable-select"

interface DetalleDevolucion {
  idProducto: number | string;
  cantidad: number;
  precioUnitario: number;
  cantidadFactura?: number;
  precioFactura?: number;
}

export default function GenerarNotaDevolucionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estado de la Cabecera
  const [formData, setFormData] = useState({
    idFacturaCompra: "",
    fecha: new Date().toISOString().split("T")[0],
    motivo: "",
  })

  // Estado de los Detalles (Productos a devolver)
  const [detalles, setDetalles] = useState<DetalleDevolucion[]>([])

  const [facturasDisponibles, setFacturasDisponibles] = useState<FacturaCompra[]>([])
  const [facturaSeleccionadaDetalles, setFacturaSeleccionadaDetalles] = useState<FacturaCompraDetalle[]>([])

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const res = await FacturasCompraAPI.getAll(1, 100)
        const items = res.items || res || []
        // Si hay una propiedad estado, filtramos por "aprobado", de lo contrario mostramos todas
        const aprobadas = items.filter((f: FacturaCompra & { estado?: string }) => !f.estado || f.estado?.toLowerCase() === "aprobado")
        setFacturasDisponibles(aprobadas.length > 0 ? aprobadas : items)
      } catch (err) {
        console.error("Error al cargar facturas", err)
      }
    }
    fetchFacturas()
  }, [])

  const handleFacturaSelect = async (idFacturaStr: string) => {
    updateCabecera("idFacturaCompra", idFacturaStr)
    setDetalles([]) // Limpiamos detalles al cambiar factura

    if (!idFacturaStr) {
      setFacturaSeleccionadaDetalles([])
      return
    }

    try {
      // Obtenemos los detalles de la factura para saber qué productos tiene
      const factura = await FacturasCompraAPI.getById(Number(idFacturaStr))
      setFacturaSeleccionadaDetalles(factura.detalles || [])
    } catch (err) {
      console.error("Error al obtener detalles de factura", err)
      notify.error("Error", "No se pudo obtener los detalles de la factura seleccionada.")
      setFacturaSeleccionadaDetalles([])
    }
  }

  const handleProductoSelect = (index: number, idProductoStr: string) => {
    const idProd = Number(idProductoStr)
    const detalleFactura = facturaSeleccionadaDetalles.find(d => d.idProducto === idProd)
    
    if (detalleFactura) {
      const nuevos = [...detalles]
      nuevos[index] = {
        ...nuevos[index],
        idProducto: idProd,
        precioUnitario: detalleFactura.precioUnitario,
        cantidad: detalleFactura.cantidad, // Ponemos por defecto el total facturado
        cantidadFactura: detalleFactura.cantidad,
        precioFactura: detalleFactura.precioUnitario
      }
      setDetalles(nuevos)
    } else {
      updateDetalle(index, "idProducto", idProductoStr)
    }
  }

  const updateCabecera = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const agregarDetalleVacio = () => {
    setDetalles([...detalles, { idProducto: "", cantidad: 1, precioUnitario: 0, cantidadFactura: 0, precioFactura: 0 }])
  }

  const updateDetalle = (index: number, field: keyof DetalleDevolucion, value: string | number) => {
    const nuevosDetalles = [...detalles]
    nuevosDetalles[index] = { ...nuevosDetalles[index], [field]: value }
    setDetalles(nuevosDetalles)
  }

  const eliminarDetalle = (index: number) => {
    const nuevosDetalles = detalles.filter((_, i) => i !== index)
    setDetalles(nuevosDetalles)
  }

  const calcularTotal = () => {
    return detalles.reduce((acc, det) => acc + (det.cantidad * det.precioUnitario), 0)
  }

  const handleSubmit = async () => {
    if (!formData.idFacturaCompra || detalles.length === 0) {
      notify.error("Validación", "Debe ingresar la factura y al menos un producto a devolver.")
      return
    }

    const validDetalles = detalles.filter(d => Number(d.idProducto) > 0)
    if (validDetalles.length === 0 || validDetalles.some(d => !d.cantidad || d.cantidad <= 0)) {
      notify.error("Validación", "Debe seleccionar un producto válido y una cantidad mayor a 0 en todas las filas.")
      return
    }

    setIsSubmitting(true)
    setIsSubmitting(true)
    try {
      const payloadCabecera = {
        idFacturaCompra: Number(formData.idFacturaCompra),
        idEstado: 1, // Asumiendo que 1 es "Borrador" o "Generado"
        fecha: formData.fecha, // Se envía "YYYY-MM-DD" sin Z para evitar el error de UTC en PostgreSQL
        motivo: formData.motivo,
      } as unknown as NotaDevolucionCompraSaveDTO

      const cabeceraGuardada = await notasDevolucionesCompraAPI.create(payloadCabecera)
      
      const idNotaDevolucionCompra = cabeceraGuardada.idNotaDevolucionCompra

      // 2. Crear los detalles uno a uno
      for (const d of validDetalles) {
        await notasDevolucionesCompraAPI.createDetalle({
          idNotaDevolucionCompra: idNotaDevolucionCompra,
          idProducto: Number(d.idProducto),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          subtotal: Number(d.cantidad) * Number(d.precioUnitario)
        })
      }

      notify.success("Éxito", "Nota de devolución registrada correctamente.")
      router.push("/compras/notas-de-devolucion")
    } catch (error: unknown) {
      console.error("Error al registrar:", error)
      const err = error as { response?: { data?: { message?: string } } };
      notify.error("Error", err?.response?.data?.message || "Ocurrió un error al intentar generar la nota.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageBreadcrumb 
        steps={[
          { label: "Compras", href: "/compras" },
          { label: "Notas de Devolución", href: "/compras/notas-de-devolucion" },
          { label: "Generar" }
        ]} 
      />

      <FormContainer
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        onCancel={() => router.push("/compras/notas-de-devolucion")}
        isEditing={false}
        submitText={{ save: isSubmitting ? "Guardando..." : "Registrar Devolución", update: "" }}
      >
        {/* SECCIÓN CABECERA */}
        <div className="border-b pb-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Datos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldWrapper id="idFacturaCompra" label="Factura Origen">
              <SearchableSelect
                items={facturasDisponibles.map(f => ({
                  value: f.idFacturaCompra.toString(),
                  label: `Factura #${f.nroComprobante || f.idFacturaCompra} ${f.proveedor ? `- ${f.proveedor}` : ''}`
                }))}
                placeholder="Seleccionar Factura..."
                onSelect={handleFacturaSelect}
                value={formData.idFacturaCompra}
              />
            </FieldWrapper>

            <FieldWrapper id="fecha" label="Fecha de Devolución">
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => updateCabecera("fecha", e.target.value)}
                required
              />
            </FieldWrapper>

            <div className="md:col-span-2">
              <FieldWrapper id="motivo" label="Motivo de la Devolución">
                <Input
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => updateCabecera("motivo", e.target.value)}
                  placeholder="Ej: Productos defectuosos, error en pedido..."
                  required
                />
              </FieldWrapper>
            </div>
          </div>
        </div>

        {/* SECCIÓN DETALLES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Productos a Devolver</h3>
            <Button type="button" variant="outline" size="sm" onClick={agregarDetalleVacio}>
              <Plus className="h-4 w-4 mr-2" /> Agregar Producto
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="w-24 text-center">Cant. Factura</TableHead>
                  <TableHead className="w-28">Cant. Devolver</TableHead>
                  <TableHead className="w-28 text-center">Precio Factura</TableHead>
                  <TableHead className="w-32">Precio Devolver</TableHead>
                  <TableHead className="w-32 text-right">Subtotal</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No hay productos agregados. Haga clic en &quot;Agregar Producto&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((det, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <SearchableSelect
                          items={facturaSeleccionadaDetalles.map(d => ({
                            value: d.idProducto.toString(),
                            label: d.producto?.descripcion || 'Producto'
                          }))}
                          placeholder="Seleccionar Producto"
                          onSelect={(val) => handleProductoSelect(index, val)}
                          value={det.idProducto.toString()}
                        />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {det.cantidadFactura ?? '-'}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max={det.cantidadFactura || undefined}
                          value={det.cantidad}
                          onChange={(e) => {
                            let val = Number(e.target.value)
                            if (det.cantidadFactura && val > det.cantidadFactura) {
                              val = det.cantidadFactura
                            }
                            updateDetalle(index, "cantidad", val)
                          }}
                          required
                        />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {det.precioFactura ? `Gs. ${det.precioFactura.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={det.precioUnitario}
                          onChange={(e) => updateDetalle(index, "precioUnitario", Number(e.target.value))}
                          required
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Gs. {(det.cantidad * det.precioUnitario).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => eliminarDetalle(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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