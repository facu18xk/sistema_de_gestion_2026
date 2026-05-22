"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, Trash2, ArrowLeft } from "lucide-react"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { OrdenCompraSaveDTO, OrdenCompraDetalleSaveDTO } from "@/types/types"

export default function EditarOrdenPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const idOrden = Number(id)

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Estados para la cabecera y el array de detalles actual
    const [cabecera, setCabecera] = useState<any>(null)
    const [detalles, setDetalles] = useState<any[]>([])
    const [detallesOriginalesIds, setDetallesOriginalesIds] = useState<number[]>([])

    useEffect(() => {
        const cargarOrdenCompleta = async () => {
            try {
                // 1. Traer datos de la cabecera
                const resCabecera = await ordenesCompraAPI.getById(idOrden)
                setCabecera(resCabecera)

                // 2. Traer todos los detalles y filtrar los que pertenecen a esta orden
                const resTodosDetalles = await ordenesCompraDetallesAPI.getAll(1, 2000)
                const listaDetalles = resTodosDetalles.items || resTodosDetalles || []
                const filtrados = listaDetalles.filter((d: any) => Number(d.idOrdenCompra) === idOrden)

                setDetalles(filtrados)
                // Guardamos los IDs originales para poder reventarlos con el DELETE masivo
                setDetallesOriginalesIds(filtrados.map((d: any) => d.idOrdenCompraDetalle).filter(Boolean))
            } catch (error) {
                notify.error("Error", "No se pudo recuperar la información de la orden.")
                router.push("/compras/ordenes")
            } finally {
                setIsLoading(false)
            }
        }
        cargarOrdenCompleta()
    }, [idOrden, router])

    const handleCambiarCantidad = (idProducto: number, nuevaCantidad: number) => {
        if (nuevaCantidad < 0) return
        setDetalles(prev =>
            prev.map(d => (d.idProducto === idProducto ? { ...d, cantidad: nuevaCantidad } : d))
        )
    }

    const handleEliminarItem = (idProducto: number) => {
        setDetalles(prev => prev.filter(d => d.idProducto !== idProducto))
    }

    const handleGuardarCambios = async () => {
        if (detalles.length === 0) {
            notify.error("Validación", "La orden no puede quedarse sin ningún producto.")
            return
        }

        setIsSaving(true)
        try {
            // 1. Actualizar datos de la cabecera (descripcion, estado, etc.)
            const payloadCabecera: Partial<OrdenCompraSaveDTO> = {
                idPedidoCotizacion: cabecera.idPedidoCotizacion,
                idProveedor: cabecera.idProveedor,
                idEstado: Number(cabecera.idEstado), // Mantiene o cambia si alteraron el select
                fecha: cabecera.fecha,
                descripcion: cabecera.descripcion
            }
            await ordenesCompraAPI.update(idOrden, payloadCabecera)

            // 2. Limpieza Masiva (DELETE de los detalles que estaban en la BD)
            for (const idDetalleViejo of detallesOriginalesIds) {
                await ordenesCompraDetallesAPI.delete(idDetalleViejo)
            }

            // 3. Re-inserción (POST de las filas con las cantidades nuevas o vigentes)
            for (const item of detalles) {
                const payloadDetalle: OrdenCompraDetalleSaveDTO = {
                    idOrdenCompraDetalle: 0, // 0 porque para la BD es un registro nuevo
                    idOrdenCompra: idOrden,
                    idProducto: item.idProducto,
                    cantidad: Number(item.cantidad)
                }
                await ordenesCompraDetallesAPI.create(payloadDetalle)
            }

            notify.success("Orden Actualizada", "Se guardaron las modificaciones y se regeneraron los detalles con éxito.")
            router.push("/compras/ordenes")
        } catch (error) {
            console.error(error)
            notify.error("Error de Guardado", "Hubo problemas al aplicar los cambios en el servidor.")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Ordenes de Compra", href: "/compras/ordenes" },
                    { label: `Editar Orden #${idOrden}` },
                ]}
            />

            <main className="container p-4">
                <div className="flex items-center gap-3 mb-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/compras/ordenes")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Modificar Orden de Compra #{idOrden}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <Card className="md:col-span-2">
                        <CardHeader className="py-2">
                            <CardTitle className="text-sm">Datos de Cabecera</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <FieldWrapper label="Descripción / Concepto" id="descripcion">
                                <Input
                                    value={cabecera.descripcion || ""}
                                    onChange={(e) => setCabecera({ ...cabecera, descripcion: e.target.value })}
                                />
                            </FieldWrapper>

                            <div className="grid grid-cols-2 gap-2">
                                <FieldWrapper label="Proveedor (Lectura)" id="prov">
                                    <Input
                                        value={typeof cabecera.proveedor === 'object' && cabecera.proveedor !== null
                                            ? cabecera.proveedor.razonSocial
                                            : (cabecera.proveedor || `ID: ${cabecera.idProveedor}`)}
                                        disabled
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Estado del Documento" id="idEstado">
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                        value={cabecera.idEstado}
                                        onChange={(e) => setCabecera({ ...cabecera, idEstado: Number(e.target.value) })}
                                    >
                                        <option value={1}>Emitida / Pendiente</option>
                                        <option value={3}>Facturado</option>
                                        <option value={4}>Anulado</option>
                                    </select>
                                </FieldWrapper>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm">Referencias de Origen</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2 text-muted-foreground">
                            <p>
                                <strong className="text-foreground">Cotización Base:</strong> #{cabecera.idCotizacionCompra}
                            </p>
                            <p>
                                <strong className="text-foreground">Pedido Original:</strong> #{cabecera.idPedidoCotizacion || "N/A"}
                            </p>
                            <p>
                                <strong className="text-foreground">Fecha Emisión:</strong> {cabecera.fecha?.substring(0, 10)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="py-3 bg-muted/40 border-b">
                        <CardTitle className="text-sm">Ítems de la Orden</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="w-40 text-center">Cantidad Solicitada</TableHead>
                                    <TableHead className="w-20"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {detalles.map((item) => (
                                    <TableRow key={item.idProducto} className="text-xs">
                                        <TableCell className="font-medium">
                                            {item.producto?.nombre || `Producto Nro #${item.idProducto}`}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input
                                                type="number"
                                                className="h-8 w-24 mx-auto text-center text-xs"
                                                value={item.cantidad}
                                                min={1}
                                                onChange={(e) => handleCambiarCantidad(item.idProducto, Number(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleEliminarItem(item.idProducto)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/ordenes")} disabled={isSaving}>
                        Cancelación
                    </Button>
                    <Button size="sm" onClick={handleGuardarCambios} disabled={isSaving} className="flex gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Reestructurando Detalles...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" /> Guardar Orden
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}