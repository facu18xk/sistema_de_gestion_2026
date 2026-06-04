"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, ArrowRight, Trash2, ShoppingCart } from "lucide-react"
import { pedidosAPI } from "@/services/pedidosAPI"
import { cotizacionesAPI } from "@/services/cotizacionesAPI"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { OrdenCompraSaveDTO, OrdenCompraDetalleSaveDTO } from "@/types/types"

interface ItemPropuesto {
    idProducto: number
    descripcion: string
    cantidad: number
    precioUnitario: number
    descuento: number
    total: number
}

interface SugerenciaOrden {
    idPedidoCotizacion: number
    idProveedor: number
    razonSocial: string
    descripcionOrden: string
    items: ItemPropuesto[]
    totalOrden: number
    cotizacionOriginal?: any // Guardamos el objeto completo para poder hacer el update de estado correctamente
}

export default function GenerarOrdenesPage() {
    const router = useRouter()
    const [pedidos, setPedidos] = useState<any[]>([])
    const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState<string>("")

    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isProcesando, setIsProcesando] = useState(false)
    const [procesandoId, setProcesandoId] = useState<number | null>(null)

    // Estado maestro con las órdenes calculadas que el usuario puede editar
    const [ordenesSugeridas, setOrdenesSugeridas] = useState<SugerenciaOrden[]>([])

    useEffect(() => {
        const cargarPedidosIniciales = async () => {
            try {
                const resPedidos = await pedidosAPI.getAll(1, 200)
                const lista = resPedidos.items || resPedidos || []
                setPedidos(lista.filter((p: any) => p.estado === "Respondido" || p.estado === "Enviado"))
            } catch (error) {
                notify.error("Error", "No se pudo traer la lista de pedidos de compra.")
            }
        }
        cargarPedidosIniciales()
    }, [])

    const handleEvaluarPedido = async (idPedido: string) => {
        setIdPedidoSeleccionado(idPedido)
        if (!idPedido) {
            setOrdenesSugeridas([])
            return
        }

        setIsLoadingData(true)
        try {
            // 1. Conseguir cotizaciones del sistema
            const resCotizaciones = await cotizacionesAPI.getAll(1, 1000)
            const listaCotizaciones = resCotizaciones.items || resCotizaciones || []

            const cotizacionesDelPedido = listaCotizaciones.filter(
                (c: any) => String(c.idPedidoCompra) === String(idPedido)
            )

            if (cotizacionesDelPedido.length === 0) {
                notify.error("Sin ofertas", "No hay cotizaciones cargadas para este pedido.")
                setOrdenesSugeridas([])
                setIsLoadingData(false)
                return
            }

            const idsCotiz = cotizacionesDelPedido.map((c: any) => Number(c.idPedidoCotizacion || c.id))

            // 2. Traer los detalles de esas cotizaciones para buscar costos mínimos
            const resDetalles = await cotizacionesDetallesAPI.getAll(1, 2000)
            const todosLosDetalles = resDetalles.items || resDetalles || []
            const detallesFiltrados = todosLosDetalles.filter((d: any) =>
                idsCotiz.includes(Number(d.idPedidoCotizacion || d.cotizacionCompraId))
            )

            // Algoritmo de optimización por costo neto mínimo
            const mejoresOpcionesPorProducto: Record<number, { detalle: any; cotizacion: any }> = {}

            detallesFiltrados.forEach((det: any) => {
                const idProd = det.idProducto || det.productoId
                const precioNetoActual = Number(det.precioProducto || det.precioUnitario) - Number(det.descuento || 0)
                const cotizacionAsociada = cotizacionesDelPedido.find(
                    (c: any) => Number(c.idPedidoCotizacion || c.id) === Number(det.idPedidoCotizacion || det.idPedidoCotizacion)
                )

                if (!mejoresOpcionesPorProducto[idProd]) {
                    mejoresOpcionesPorProducto[idProd] = { detalle: det, cotizacion: cotizacionAsociada }
                } else {
                    const mejorDetallePrevio = mejoresOpcionesPorProducto[idProd].detalle
                    const precioNetoMejor = Number(mejorDetallePrevio.precioProducto || mejorDetallePrevio.precioUnitario) - Number(mejorDetallePrevio.descuento || 0)

                    if (precioNetoActual < precioNetoMejor) {
                        mejoresOpcionesPorProducto[idProd] = { detalle: det, cotizacion: cotizacionAsociada }
                    }
                }
            })

            // 3. Agrupar por Cotización
            const agrupacionSugerida: Record<number, SugerenciaOrden> = {}

            Object.keys(mejoresOpcionesPorProducto).forEach((prodIdKey) => {
                const prodId = Number(prodIdKey)
                const { detalle, cotizacion } = mejoresOpcionesPorProducto[prodId]
                const idCotizacion = Number(cotizacion.idPedidoCotizacion || cotizacion.id)

                const precioUnitario = Number(detalle.precioProducto || detalle.precioUnitario)
                const dsc = Number(detalle.descuento || 0)
                const cant = Number(detalle.cantidad)
                const totalItem = (precioUnitario - dsc) * cant

                if (!agrupacionSugerida[idCotizacion]) {
                    agrupacionSugerida[idCotizacion] = {
                        idPedidoCotizacion: Number(cotizacion.idPedidoCotizacion || 0),
                        idProveedor: Number(cotizacion.idProveedor),
                        razonSocial: typeof cotizacion.proveedor === 'object' && cotizacion.proveedor !== null
                            ? cotizacion.proveedor.razonSocial
                            : (cotizacion.proveedor || `Proveedor de Cotiz. #${idCotizacion}`),
                        descripcionOrden: `Orden generada automáticamente desde Pedido #${idPedido}`,
                        items: [],
                        totalOrden: 0,
                        cotizacionOriginal: cotizacion,
                    }
                }

                agrupacionSugerida[idCotizacion].items.push({
                    idProducto: prodId,
                    descripcion: detalle.descripcion || `Producto #${prodId}`,
                    cantidad: cant,
                    precioUnitario: precioUnitario,
                    descuento: dsc,
                    total: totalItem,
                })
            })

            const resultadoFinal = Object.values(agrupacionSugerida).map(orden => ({
                ...orden,
                totalOrden: orden.items.reduce((acc, item) => acc + item.total, 0)
            }))

            setOrdenesSugeridas(resultadoFinal)
            notify.success("Análisis completo", "Sugerencias de compra listas basándose en precios más convenientes.")
        } catch (err) {
            console.error(err)
            notify.error("Error", "No se pudo procesar la matriz de cotizaciones.")
        } finally {
            setIsLoadingData(false)
        }
    }

    const handleCambiarCantidad = (idCotizacion: number, idProducto: number, nuevaCantidad: number) => {
        if (nuevaCantidad < 0) return

        setOrdenesSugeridas(prev =>
            prev.map(orden => {
                if (orden.idPedidoCotizacion !== idCotizacion) return orden

                const nuevosItems = orden.items.map(item => {
                    if (item.idProducto !== idProducto) return item
                    return {
                        ...item,
                        amount: nuevaCantidad,
                        cantidad: nuevaCantidad,
                        total: (item.precioUnitario - item.descuento) * nuevaCantidad
                    }
                })

                return {
                    ...orden,
                    items: nuevosItems,
                    totalOrden: nuevosItems.reduce((acc, i) => acc + i.total, 0)
                }
            })
        )
    }

    const handleEliminarItem = (idCotizacion: number, idProducto: number) => {
        setOrdenesSugeridas(prev =>
            prev.map(orden => {
                if (orden.idPedidoCotizacion !== idCotizacion) return orden
                const nuevosItems = orden.items.filter(i => i.idProducto !== idProducto)
                return {
                    ...orden,
                    items: nuevosItems,
                    totalOrden: nuevosItems.reduce((acc, i) => acc + i.total, 0)
                }
            }).filter(orden => orden.items.length > 0)
        )
    }

    // Procesa y guarda una orden individual, además actualiza el estado de la cotización original
    const procesarUnaOrden = async (sugerencia: SugerenciaOrden) => {
        const cabeceraPayload: OrdenCompraSaveDTO = {
            idPedidoCotizacion: sugerencia.idPedidoCotizacion,
            idProveedor: sugerencia.idProveedor,
            idEstado: 1,
            fecha: new Date().toISOString().split("T")[0],
            descripcion: sugerencia.descripcionOrden,
        }
        console.log(cabeceraPayload);
        // 1. Guardar cabecera de la orden
        const nuevaOrdenRes = await ordenesCompraAPI.create(cabeceraPayload)
        const idOrdenGenerada = nuevaOrdenRes?.idOrdenCompra

        if (!idOrdenGenerada) {
            throw new Error(`El servidor no retornó un idOrdenCompra válido para la cotización #${sugerencia.idPedidoCotizacion}`)
        }

        // 2. Guardar detalles
        const itemsAProcesar = sugerencia.items.filter(item => item.cantidad > 0)
        const promesasDetalles = itemsAProcesar.map((item) => {
            const detallePayload: OrdenCompraDetalleSaveDTO = {
                idOrdenCompraDetalle: 0,
                idOrdenCompra: idOrdenGenerada,
                idProducto: item.idProducto,
                cantidad: item.cantidad
            }
            return ordenesCompraDetallesAPI.create(detallePayload)
        })

        await Promise.all(promesasDetalles)

        // 3. Update de estado de la cotización a Aprobada
        if (sugerencia.cotizacionOriginal) {
            const cotizacionUpdatePayload = {
                ...sugerencia.cotizacionOriginal,
                estado: "Aprobada", // Modificamos el campo string o el ID correspondiente según tu backend
                idEstado: 2 // Por si maneja identificadores de estado numéricos
            }
            const idCotiz = sugerencia.idPedidoCotizacion || sugerencia.cotizacionOriginal.id
            await cotizacionesAPI.update(idCotiz, cotizacionUpdatePayload)
        }
    }

    const handleGenerarOrdenIndividual = async (sugerencia: SugerenciaOrden) => {
        setIsProcesando(true)
        setProcesandoId(sugerencia.idPedidoCotizacion)
        try {
            await procesarUnaOrden(sugerencia)
            notify.success("Éxito", `Orden de compra creada correctamente para la Cotización #${sugerencia.idPedidoCotizacion} y cotización marcada como Aprobada.`)

            setOrdenesSugeridas(prev => prev.filter(o => o.idPedidoCotizacion !== sugerencia.idPedidoCotizacion))
        } catch (error: any) {
            console.error("Error al generar orden individual:", error)
            const detalleError = error?.response?.data?.message || "Fallo interno al procesar la orden."
            notify.error("Error", detalleError)
        } finally {
            setIsProcesando(false)
            setProcesandoId(null)
        }
    }

    const handleConfirmarGeneracion = async () => {
        if (ordenesSugeridas.length === 0) return

        setIsProcesando(true)
        try {
            // Iteramos de manera secuencial sobre cada orden sugerida restante
            for (const sugerencia of ordenesSugeridas) {
                await procesarUnaOrden(sugerencia)
            }

            notify.success("Éxito", `Se procesaron y crearon ${ordenesSugeridas.length} órdenes de compra correctamente. Cotizaciones actualizadas a Aprobadas.`)
            router.push("/compras/ordenes")
        } catch (error: any) {
            console.error("Error en el flujo de confirmación masiva:", error)
            const detalleError = error?.response?.data?.message || "Inconsistencia de datos o fallo interno del servidor (500)."
            notify.error("Error crítico", detalleError)
        } finally {
            setIsProcesando(false)
        }
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Órdenes de Compra", href: "/compras/ordenes" },
                    { label: "Generar Orden" },
                ]}
            />

            <main className="container mx-auto p-4 max-w-5xl">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Generar Órdenes de Compra</h2>

                <Card className="mb-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Pedido de Origen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldWrapper label="Seleccionar Pedido" id="pedidoSelect">
                            <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                value={idPedidoSeleccionado}
                                onChange={(e) => handleEvaluarPedido(e.target.value)}
                                disabled={isProcesando}
                            >
                                <option value="">Seleccione un pedido...</option>
                                {pedidos.map((p) => (
                                    <option key={p.idPedidoCompra} value={String(p.idPedidoCompra)}>
                                        Pedido #{p.idPedidoCompra} — {p.descripcion || "Sin descripción"}
                                    </option>
                                ))}
                            </select>
                        </FieldWrapper>
                    </CardContent>
                </Card>

                {isLoadingData && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Analizando cotizaciones de menor costo...</p>
                    </div>
                )}

                {!isLoadingData && ordenesSugeridas.length > 0 && (
                    <div className="space-y-6">
                        {ordenesSugeridas.map((orden) => (
                            <Card key={orden.idPedidoCotizacion} className="border-l-4 border-l-primary shadow-xs">
                                <CardHeader className="bg-muted/30 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-primary">
                                            Propuesta de Orden (Cotización #{orden.idPedidoCotizacion})
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium mt-1">
                                            Proveedor: <span className="text-foreground font-semibold">{orden.razonSocial}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="md:text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Estimado</p>
                                            <p className="text-base font-black text-primary">
                                                {orden.totalOrden.toLocaleString("es-PY")} Gs.
                                            </p>
                                        </div>
                                        <Button
                                            size="xs"
                                            variant="secondary"
                                            className="h-8 flex gap-1 text-xs"
                                            disabled={isProcesando}
                                            onClick={() => handleGenerarOrdenIndividual(orden)}
                                        >
                                            {isProcesando && procesandoId === orden.idPedidoCotizacion ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <ShoppingCart className="h-3 w-3" />
                                            )}
                                            Generar Solo Esta
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-3 bg-card border-b">
                                        <FieldWrapper label="Descripción / Nota de la Orden" id={`desc-${orden.idPedidoCotizacion}`}>
                                            <Input
                                                className="h-8 text-xs"
                                                value={orden.descripcionOrden}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    setOrdenesSugeridas(prev => prev.map(o => o.idPedidoCotizacion === orden.idPedidoCotizacion ? { ...o, descripcionOrden: val } : o))
                                                }}
                                                disabled={isProcesando}
                                            />
                                        </FieldWrapper>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="w-32 text-center">Cantidad</TableHead>
                                                <TableHead className="text-right">Precio Unit.</TableHead>
                                                <TableHead className="text-right">Desc.</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orden.items.map((item) => (
                                                <TableRow key={item.idProducto} className="text-xs">
                                                    <TableCell className="font-medium">{item.descripcion}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            className="h-7 w-20 mx-auto text-center text-xs p-1"
                                                            value={item.cantidad}
                                                            min={0}
                                                            onChange={(e) => handleCambiarCantidad(orden.idPedidoCotizacion, item.idProducto, Number(e.target.value))}
                                                            disabled={isProcesando}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">{item.precioUnitario.toLocaleString("es-PY")} Gs.</TableCell>
                                                    <TableCell className="text-right">{item.descuento.toLocaleString("es-PY")} Gs.</TableCell>
                                                    <TableCell className="text-right">{item.total.toLocaleString("es-PY")} Gs.</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleEliminarItem(orden.idPedidoCotizacion, item.idProducto)}
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
                        ))}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" size="sm" onClick={() => router.push("/compras/ordenes")} disabled={isProcesando}>
                                Volver
                            </Button>
                            <Button size="sm" onClick={handleConfirmarGeneracion} disabled={isProcesando} className="flex gap-2">
                                {isProcesando && procesandoId === null ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Creando Ordenes
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" /> Confirmar Todas las Ordenes
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