"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, Trash2, ShoppingCart, Search, SlidersHorizontal, Sparkles } from "lucide-react"
import { pedidosAPI } from "@/services/pedidosAPI"
import { cotizacionesAPI } from "@/services/cotizacionesAPI"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    cotizacionOriginal?: any
}

export default function GenerarOrdenesPage() {
    const router = useRouter()

    // Estados de datos base
    const [pedidos, setPedidos] = useState<any[]>([])
    const [filtroBusquedaPedido, setFiltroBusquedaPedido] = useState<string>("")
    const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState<string>("")

    // Configuración de estrategia de generación
    const [modoGeneracion, setModoGeneracion] = useState<"automatico" | "manual">("automatico")
    const [cotizacionesDisponibles, setCotizacionesDisponibles] = useState<any[]>([])
    const [idCotizacionManual, setIdCotizacionManual] = useState<string>("")

    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isProcesando, setIsProcesando] = useState(false)
    const [procesandoId, setProcesandoId] = useState<number | null>(null)

    // Estado maestro de órdenes en preparación (mutables por el usuario)
    const [ordenesSugeridas, setOrdenesSugeridas] = useState<SugerenciaOrden[]>([])

    // Cargar pedidos iniciales válidos
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

    // Filtrado en tiempo real de los pedidos disponibles en el sistema
    const pedidosFiltrados = pedidos.filter((p) => {
        return String(p.idPedidoCompra).includes(filtroBusquedaPedido)
    })

    // Handler principal cuando cambia el pedido seleccionado
    const handleCambioPedido = async (idPedido: string) => {
        setIdPedidoSeleccionado(idPedido)
        setIdCotizacionManual("")
        setOrdenesSugeridas([])
        setCotizacionesDisponibles([])

        if (!idPedido) return

        setIsLoadingData(true)
        try {
            // Traer todas las cotizaciones asociadas a este pedido específico
            const resCotizaciones = await cotizacionesAPI.getAll(1, 1000)
            const listaCotizaciones = resCotizaciones.items || resCotizaciones || []
            const filtradas = listaCotizaciones.filter((c: any) => String(c.idPedidoCompra) === String(idPedido))

            setCotizacionesDisponibles(filtradas)

            if (filtradas.length === 0) {
                notify.error("Sin ofertas", "No existen cotizaciones registradas para el Pedido seleccionado.")
                setIsLoadingData(false)
                return
            }

            // Si está en modo automático, ejecuta directamente el algoritmo de optimización de costos
            if (modoGeneracion === "automatico") {
                await ejecutarAlgoritmoOptimizado(idPedido, filtradas)
            }
        } catch (error) {
            console.error(error)
            notify.error("Error", "Error al mapear las cotizaciones del pedido.")
        } finally {
            setIsLoadingData(false)
        }
    }

    // Cambiar de modo de estrategia (Costo mínimo vs Selección manual de Proveedor)
    const handleCambiarModo = async (nuevoModo: "automatico" | "manual") => {
        setModoGeneracion(nuevoModo)
        setOrdenesSugeridas([])
        setIdCotizacionManual("")

        if (idPedidoSeleccionado && cotizacionesDisponibles.length > 0) {
            if (nuevoModo === "automatico") {
                setIsLoadingData(true)
                await ejecutarAlgoritmoOptimizado(idPedidoSeleccionado, cotizacionesDisponibles)
                setIsLoadingData(false)
            }
        }
    }

    // Algoritmo de optimización distributiva por costo neto mínimo (Tu lógica original intacta)
    const ejecutarAlgoritmoOptimizado = async (idPedido: string, cotizacionesValidas: any[]) => {
        const idsCotiz = cotizacionesValidas.map((c: any) => Number(c.idPedidoCotizacion || c.id))
        const resDetalles = await cotizacionesDetallesAPI.getAll(1, 2000)
        const todosLosDetalles = resDetalles.items || resDetalles || []
        const detallesFiltrados = todosLosDetalles.filter((d: any) =>
            idsCotiz.includes(Number(d.idPedidoCotizacion || d.cotizacionCompraId))
        )

        const mejoresOpcionesPorProducto: Record<number, { detalle: any; cotizacion: any }> = {}

        detallesFiltrados.forEach((det: any) => {
            const idProd = det.idProducto || det.productoId
            const precioNetoActual = Number(det.precioProducto || det.precioUnitario) - Number(det.descuento || 0)
            const cotizacionAsociada = cotizacionesValidas.find(
                (c: any) => Number(c.idPedidoCotizacion || c.id) === Number(det.idPedidoCotizacion)
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
                        : (cotizacion.proveedor || `Proveedor Cotiz. #${idCotizacion}`),
                    descripcionOrden: `Orden automatizada (Menor Costo) desde Pedido #${idPedido}`,
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
        notify.success("Análisis Distributivo", "Se estructuraron las órdenes optimizando cada ítem al precio más bajo.")
    }

    // Construir la orden basándose puramente en la cotización seleccionada por el usuario (A gusto)
    const handleSeleccionarCotizacionManual = async (idCotizacion: string) => {
        setIdCotizacionManual(idCotizacion)
        if (!idCotizacion) {
            setOrdenesSugeridas([])
            return
        }

        setIsLoadingData(true)
        try {
            const cotizacion = cotizacionesDisponibles.find(c => String(c.idPedidoCotizacion || c.id) === String(idCotizacion))
            const resDetalles = await cotizacionesDetallesAPI.getAll(1, 2000)
            const todosLosDetalles = resDetalles.items || resDetalles || []

            // Traer únicamente los ítems ofertados por este proveedor específico
            const detallesDeEstaCotizacion = todosLosDetalles.filter((d: any) =>
                String(d.idPedidoCotizacion || d.cotizacionCompraId) === String(idCotizacion)
            )

            const itemsMapeados: ItemPropuesto[] = detallesDeEstaCotizacion.map((det: any) => {
                const precio = Number(det.precioProducto || det.precioUnitario) || 0
                const dsc = Number(det.descuento || 0)
                const cant = Number(det.cantidad) || 0
                return {
                    idProducto: det.idProducto || det.productoId,
                    descripcion: det.descripcion || `Producto #${det.idProducto}`,
                    cantidad: cant,
                    precioUnitario: precio,
                    descuento: dsc,
                    total: (precio - dsc) * cant
                }
            })

            const ordenPersonalizada: SugerenciaOrden = {
                idPedidoCotizacion: Number(idCotizacion),
                idProveedor: Number(cotizacion.idProveedor),
                razonSocial: typeof cotizacion.proveedor === 'object' && cotizacion.proveedor !== null
                    ? cotizacion.proveedor.razonSocial
                    : (cotizacion.proveedor || `Proveedor Seleccionado`),
                descripcionOrden: `Orden de Compra directa desde Cotización #${idCotizacion}`,
                items: itemsMapeados,
                totalOrden: itemsMapeados.reduce((acc, i) => acc + i.total, 0),
                cotizacionOriginal: cotizacion
            }

            setOrdenesSugeridas([ordenPersonalizada])
            notify.success("Estrategia Manual", "Cargando ítems completos provistos por el proveedor seleccionado.")
        } catch (error) {
            console.error(error)
            notify.error("Error", "No se pudieron recopilar las líneas de la cotización seleccionada.")
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

    const procesarUnaOrden = async (sugerencia: SugerenciaOrden) => {
        const cabeceraPayload: OrdenCompraSaveDTO = {
            idPedidoCotizacion: sugerencia.idPedidoCotizacion,
            idProveedor: sugerencia.idProveedor,
            idEstado: 1,
            fecha: new Date().toISOString().split("T")[0],
            descripcion: sugerencia.descripcionOrden,
        }

        const nuevaOrdenRes = await ordenesCompraAPI.create(cabeceraPayload)
        const idOrdenGenerada = nuevaOrdenRes?.idOrdenCompra

        if (!idOrdenGenerada) {
            throw new Error(`Error en el alta de cabecera para la cotización #${sugerencia.idPedidoCotizacion}`)
        }

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

        if (sugerencia.cotizacionOriginal) {
            const cotizacionUpdatePayload = {
                ...sugerencia.cotizacionOriginal,
                estado: "Aprobada",
                idEstado: 2
            }
            await cotizacionesAPI.update(sugerencia.idPedidoCotizacion, cotizacionUpdatePayload)
        }
    }

    const handleGenerarOrdenIndividual = async (sugerencia: SugerenciaOrden) => {
        setIsProcesando(true)
        setProcesandoId(sugerencia.idPedidoCotizacion)
        try {
            await procesarUnaOrden(sugerencia)
            notify.success("Éxito", `Orden emitida correctamente para la Cotización #${sugerencia.idPedidoCotizacion}.`)
            setOrdenesSugeridas(prev => prev.filter(o => o.idPedidoCotizacion !== sugerencia.idPedidoCotizacion))
        } catch (error: any) {
            console.error(error)
            notify.error("Error", error?.response?.data?.message || "Fallo transaccional al guardar la orden.")
        } finally {
            setIsProcesando(false)
            setProcesandoId(null)
        }
    }

    const handleConfirmarGeneracion = async () => {
        if (ordenesSugeridas.length === 0) return
        setIsProcesando(true)
        try {
            for (const sugerencia of ordenesSugeridas) {
                await procesarUnaOrden(sugerencia)
            }
            notify.success("Procesamiento Exitoso", `Se emitieron ${ordenesSugeridas.length} órdenes de compra globales.`)
            router.push("/compras/ordenes")
        } catch (error: any) {
            console.error(error)
            notify.error("Error Crítico", error?.response?.data?.message || "Error de red o consistencia.")
        } finally {
            setIsProcesando(false)
        }
    }

    return (
        <div className="bg-background pb-12">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Órdenes de Compra", href: "/compras/ordenes" },
                    { label: "Generar Orden" },
                ]}
            />

            <main className="container mx-auto p-4 max-w-5xl">
                {/* Título y botón alineados horizontalmente, pegados al nivel del breadcrumb */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Generar Órdenes</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/compras/ordenes")}
                        disabled={isProcesando}
                        className="h-8 text-xs px-3"
                    >
                        Volver
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                Origen del Pedido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-end gap-4">
                                {/* Input de Filtro - Ocupa el 40% */}
                                <div className="space-y-1.5 w-full sm:basis-2/5">
                                    <label className="text-[11px] font-medium text-muted-foreground">Buscar Nro Pedido</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Nro de pedido..."
                                            className="pl-8 h-9 text-xs"
                                            value={filtroBusquedaPedido}
                                            onChange={(e) => setFiltroBusquedaPedido(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Select de Pedido - Ocupa el 60% */}
                                <div className="w-full sm:basis-3/5">
                                    <FieldWrapper label="Nro. Pedido" id="pedidoSelect">
                                        <select
                                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary cursor-pointer"
                                            value={idPedidoSeleccionado}
                                            onChange={(e) => handleCambioPedido(e.target.value)}
                                            disabled={isProcesando}
                                        >
                                            <option value="">Seleccione un pedido...</option>
                                            {pedidosFiltrados.map((p) => (
                                                <option key={p.idPedidoCompra} value={String(p.idPedidoCompra)}>
                                                    Pedido Nro. {p.idPedidoCompra}
                                                </option>
                                            ))}
                                        </select>
                                    </FieldWrapper>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tarjeta 2: Criterio de Selección */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                                Criterio
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Tabs
                                value={modoGeneracion}
                                onValueChange={(val) => handleCambiarModo(val as "automatico" | "manual")}
                                className="w-full"
                            >
                                <TabsList className="grid grid-cols-2 w-full h-9">
                                    <TabsTrigger value="automatico" className="text-xs gap-1">
                                        <Sparkles className="size-3" /> Auto
                                    </TabsTrigger>
                                    <TabsTrigger value="manual" className="text-xs">
                                        Manual
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {modoGeneracion === "manual" && (
                                <FieldWrapper label="Cotización Adjudicada" id="cotizacionManualSelect">
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary disabled:opacity-60 cursor-pointer"
                                        value={idCotizacionManual}
                                        onChange={(e) => handleSeleccionarCotizacionManual(e.target.value)}
                                        disabled={!idPedidoSeleccionado || isProcesando}
                                    >
                                        <option value="">Seleccione una cotización...</option>
                                        {cotizacionesDisponibles.map((c) => {
                                            const provNombre = typeof c.proveedor === 'object' ? c.proveedor?.razonSocial : c.proveedor
                                            return (
                                                <option key={c.idPedidoCotizacion || c.id} value={String(c.idPedidoCotizacion || c.id)}>
                                                    Cotiz. #{c.idPedidoCotizacion || c.id} — {provNombre || `Prov. #${c.idProveedor}`}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </FieldWrapper>
                            )}

                            {modoGeneracion === "automatico" && idPedidoSeleccionado && (
                                <p className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-2 rounded">
                                    ✨ Menor Costo: Distribución automática por precio neto mínimo por ítem.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {isLoadingData && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Procesando matriz de costos...</p>
                    </div>
                )}

                {/* Renderizado de Órdenes Sugeridas en preparación */}
                {!isLoadingData && ordenesSugeridas.length > 0 && (
                    <div className="space-y-6">
                        {ordenesSugeridas.map((orden) => (
                            <Card key={orden.idPedidoCotizacion} className="border-l-4 border-l-primary shadow-xs">
                                <CardHeader className="bg-muted/30 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-sm font-bold text-primary">
                                            Borrador de Orden (Cotización #{orden.idPedidoCotizacion})
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground font-medium mt-1">
                                            Proveedor: <span className="text-foreground font-semibold">{orden.razonSocial}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="md:text-right">
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monto Total</p>
                                            <p className="text-base font-black text-primary">
                                                {orden.totalOrden.toLocaleString("es-PY")} Gs.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-8 flex gap-1 text-xs font-semibold cursor-pointer"
                                            disabled={isProcesando}
                                            onClick={() => handleGenerarOrdenIndividual(orden)}
                                        >
                                            {isProcesando && procesandoId === orden.idPedidoCotizacion ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <ShoppingCart className="h-3 w-3" />
                                            )}
                                            Crear Orden
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="p-3 bg-card border-b">
                                        <FieldWrapper label="Nota / Descripción de la Orden" id={`desc-${orden.idPedidoCotizacion}`}>
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
                                                <TableHead className="text-right">Descuento</TableHead>
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
                                                    <TableCell className="text-right text-destructive">-{item.descuento.toLocaleString("es-PY")} Gs.</TableCell>
                                                    <TableCell className="text-right font-semibold">{item.total.toLocaleString("es-PY")} Gs.</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
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

                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="outline" size="sm" onClick={() => router.push("/compras/ordenes")} disabled={isProcesando}>
                                Cancelar
                            </Button>
                            <Button size="sm" onClick={handleConfirmarGeneracion} disabled={isProcesando} className="flex gap-2 cursor-pointer">
                                {isProcesando && procesandoId === null ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Procesando Lote...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" /> Generar Órdenes
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