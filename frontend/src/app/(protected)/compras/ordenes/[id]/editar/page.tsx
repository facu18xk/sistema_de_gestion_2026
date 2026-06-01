"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Trash2, FileText } from "lucide-react"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { OrdenCompraSaveDTO, OrdenCompraDetalleSaveDTO } from "@/types/types"

interface ItemOrden {
    idOrdenCompraDetalle: number
    idProducto: number
    descripcion: string
    cantidad: number
    // Campos opcionales en caso de que tu backend devuelva o necesite precios reflejados
    precioUnitario?: number
    total?: number
}

export default function EditarOrdenPage() {
    const router = useRouter()
    const params = useParams()
    const idOrden = params?.id ? Number(params.id) : null

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isProcesando, setIsProcesando] = useState(false)

    // Estados del formulario (Cabecera)
    const [idPedidoCotizacion, setIdPedidoCotizacion] = useState<number>(0)
    const [idProveedor, setIdProveedor] = useState<number>(0)
    const [idEstado, setIdEstado] = useState<number>(1)
    const [fecha, setFecha] = useState<string>("")
    const [descripcion, setDescripcion] = useState<string>("")
    const [proveedorNombre, setProveedorNombre] = useState<string>("")

    // Estado de los ítems de la orden (Detalle)
    const [items, setItems] = useState<ItemOrden[]>([])

    useEffect(() => {
        if (!idOrden) {
            notify.error("Error", "ID de orden de compra no válido.")
            router.push("/compras/ordenes")
            return
        }

        const cargarDatosOrden = async () => {
            setIsLoadingData(true)
            try {
                // 1. Obtener la cabecera de la orden de compra
                // Nota: Reemplazar por .get u obtener individual si tu API lo expone directamente, 
                // de lo contrario usamos getAll y filtramos como en el listado maestro.
                const resOrdenes = await ordenesCompraAPI.getAll(1, 1000)
                const listaOrdenes = resOrdenes.items || resOrdenes || []
                const ordenActual = listaOrdenes.find((o: any) => Number(o.idOrdenCompra || o.id) === idOrden)

                if (!ordenActual) {
                    notify.error("No encontrado", "No se encontró la orden de compra solicitada.")
                    router.push("/compras/ordenes")
                    return
                }

                // Seteamos los datos de la cabecera
                setIdPedidoCotizacion(ordenActual.idPedidoCotizacion)
                setIdProveedor(ordenActual.idProveedor)
                setIdEstado(ordenActual.idEstado || 1)
                setFecha(ordenActual.fecha ? ordenActual.fecha.split("T")[0] : "")
                setDescripcion(ordenActual.descripcion || "")
                setProveedorNombre(ordenActual.proveedor?.razonSocial || ordenActual.razonSocial || `Proveedor #${ordenActual.idProveedor}`)

                // 2. Obtener los detalles de la orden
                const resDetalles = await ordenesCompraDetallesAPI.getAll(1, 2000)
                const todosLosDetalles = resDetalles.items || resDetalles || []

                // Filtrar los detalles que correspondan a esta orden
                const detallesFiltrados = todosLosDetalles.filter(
                    (d: any) => Number(d.idOrdenCompra) === idOrden
                )

                const itemsMapeados: ItemOrden[] = detallesFiltrados.map((d: any) => ({
                    idOrdenCompraDetalle: d.idOrdenCompraDetalle || d.id || 0,
                    idProducto: d.idProducto || d.productoId,
                    descripcion: d.producto?.descripcion || d.descripcion || `Producto #${d.idProducto || d.productoId}`,
                    cantidad: Number(d.cantidad || 0),
                    precioUnitario: d.precioUnitario || 0,
                    total: Number(d.cantidad || 0) * Number(d.precioUnitario || 0)
                }))

                setItems(itemsMapeados)
            } catch (error) {
                console.error(error)
                notify.error("Error", "No se pudieron cargar los detalles de la orden de compra.")
            } finally {
                setIsLoadingData(false)
            }
        }

        cargarDatosOrden()
    }, [idOrden, router])

    const handleCambiarCantidad = (idProducto: number, nuevaCantidad: number) => {
        if (nuevaCantidad < 0) return

        setItems(prev =>
            prev.map(item => {
                if (item.idProducto !== idProducto) return item
                return {
                    ...item,
                    cantidad: nuevaCantidad,
                    total: (item.precioUnitario || 0) * nuevaCantidad
                }
            })
        )
    }

    const handleEliminarItem = (idProducto: number) => {
        setItems(prev => prev.filter(item => item.idProducto !== idProducto))
    }

    const handleGuardarCambios = async () => {
        if (items.length === 0) {
            notify.error("Validación", "La orden no puede quedar vacía. Elimine la orden si ya no la requiere.")
            return
        }

        setIsProcesando(true)
        try {
            // 1. Armar payload de actualización para la cabecera
            const cabeceraPayload: OrdenCompraSaveDTO = {
                idPedidoCotizacion,
                idProveedor,
                idEstado,
                fecha,
                descripcion,
            }

            // Actualizar cabecera de la orden
            await ordenesCompraAPI.update(idOrden!, cabeceraPayload)

            // 2. Actualizar los detalles
            // El enfoque más limpio suele ser enviar a actualizar los registros mutados.
            // Para acoplarnos a tu API.create de detalles, procesamos los ítems actuales:
            const promesasDetalles = items.map((item) => {
                const detallePayload: OrdenCompraDetalleSaveDTO = {
                    idOrdenCompraDetalle: item.idOrdenCompraDetalle,
                    idOrdenCompra: idOrden!,
                    idProducto: item.idProducto,
                    cantidad: item.cantidad
                }

                if (item.idOrdenCompraDetalle > 0) {
                    // Si ya existía, usamos el update de detalles
                    return ordenesCompraDetallesAPI.update(item.idOrdenCompraDetalle, detallePayload)
                } else {
                    // Si fuese un ítem nuevo incorporado en la edición
                    return ordenesCompraDetallesAPI.create(detallePayload)
                }
            })

            await Promise.all(promesasDetalles)

            notify.success("Éxito", "La orden de compra ha sido actualizada correctamente.")
            router.push("/compras/ordenes")
        } catch (error: any) {
            console.error("Error al actualizar la orden:", error)
            const detalleError = error?.response?.data?.message || "Fallo interno al guardar los cambios de la orden."
            notify.error("Error al guardar", detalleError)
        } finally {
            setIsProcesando(false)
        }
    }

    // Cálculo del total estimado de la orden en la UI (en caso de manejar precios mapeados)
    const totalOrdenEstimado = items.reduce((acc, item) => acc + (item.total || 0), 0)

    return (
        <div className="bg-background">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Órdenes de Compra", href: "/compras/ordenes" },
                    { label: `Editar Orden #${idOrden}` },
                ]}
            />

            <main className="container mx-auto p-4 max-w-5xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">Editar Orden de Compra #{idOrden}</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/compras/ordenes")}
                        disabled={isProcesando}
                        className="flex gap-1 h-8 text-xs"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Volver al Listado
                    </Button>
                </div>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Cargando datos de la orden y sus componentes...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tarjeta de Información General */}
                        <Card className="shadow-xs">
                            <CardHeader className="bg-muted/20 py-3">
                                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Datos de Cabecera
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FieldWrapper label="Proveedor (No Editable)" id="proveedor">
                                    <Input value={proveedorNombre} disabled className="h-9 bg-muted/40 text-xs font-medium" />
                                </FieldWrapper>

                                <FieldWrapper label="Fecha de la Orden" id="fecha">
                                    <Input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        disabled={isProcesando}
                                        className="h-9 text-xs"
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Descripción / Observación" id="descripcion">
                                    <Input
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        disabled={isProcesando}
                                        className="h-9 text-xs"
                                        placeholder="Ej. Entrega urgente en depósito principal..."
                                    />
                                </FieldWrapper>
                            </CardContent>
                        </Card>

                        {/* Tarjeta del Detalle de Artículos */}
                        <Card className="border-l-4 border-l-primary shadow-xs">
                            <CardHeader className="bg-muted/10 py-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold text-primary">
                                    Artículos Incluidos en la Orden
                                </CardTitle>
                                {totalOrdenEstimado > 0 && (
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-primary">
                                            Total: {totalOrdenEstimado.toLocaleString("es-PY")} Gs.
                                        </p>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="w-32 text-center">Cantidad</TableHead>
                                            {items[0]?.precioUnitario !== undefined && items[0].precioUnitario > 0 && (
                                                <>
                                                    <TableHead className="text-right">Precio Unit.</TableHead>
                                                    <TableHead className="text-right">Subtotal</TableHead>
                                                </>
                                            )}
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.idProducto} className="text-xs">
                                                <TableCell className="font-medium">{item.descripcion}</TableCell>
                                                <TableCell className="text-center">
                                                    <Input
                                                        type="number"
                                                        className="h-7 w-20 mx-auto text-center text-xs p-1"
                                                        value={item.cantidad}
                                                        min={1}
                                                        onChange={(e) => handleCambiarCantidad(item.idProducto, Number(e.target.value))}
                                                        disabled={isProcesando}
                                                    />
                                                </TableCell>
                                                {item.precioUnitario !== undefined && item.precioUnitario > 0 && (
                                                    <>
                                                        <TableCell className="text-right">
                                                            {item.precioUnitario.toLocaleString("es-PY")} Gs.
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {(item.total || 0).toLocaleString("es-PY")} Gs.
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleEliminarItem(item.idProducto)}
                                                        disabled={isProcesando}
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

                        {/* Botonera de Acciones de Cierre */}
                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/compras/ordenes")}
                                disabled={isProcesando}
                            >
                                Cancelar
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleGuardarCambios}
                                disabled={isProcesando}
                                className="flex gap-2"
                            >
                                {isProcesando ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Guardando Cambios...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Guardar Orden de Compra
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}