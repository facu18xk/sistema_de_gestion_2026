"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Trash2, Receipt, ChevronLeft, ChevronRight, ListPlus } from "lucide-react"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { notasCreditosCompraAPI } from "@/services/notasCreditosCompraApi"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal"
import { OrdenCompraSaveDTO, OrdenCompraDetalleSaveDTO, FacturaCompra } from "@/types/types"

interface ItemOrden {
    idOrdenCompraDetalle: number
    idProducto: number
    descripcion: string
    categoria?: string
    cantidad: number
    precioUnitario: number
    descuento: number
    entregado: number
    total: number
}

const ESTADOS_MAP: Record<number, string> = {
    1: "Pendiente", 2: "Aprobado", 3: "Enviado", 4: "Respondido", 5: "Expirado",
    6: "Rechazado", 7: "Emitido", 8: "Anulado", 9: "Facturado", 10: "Registrado", 11: "Completado"
}

function EditarOrdenPageContent() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const idOrden = params?.id ? Number(params.id) : null
    const isReadOnlyParam = searchParams?.get("readOnly") === "true"

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isProcesando, setIsProcesando] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Cabecera
    const [idPedidoCotizacion, setIdPedidoCotizacion] = useState<number>(0)
    const [idProveedor, setIdProveedor] = useState<number>(0)
    const [idEstado, setIdEstado] = useState<number>(1)
    const [fecha, setFecha] = useState<string>("")
    const [descripcion, setDescripcion] = useState<string>("")
    const [proveedorNombre, setProveedorNombre] = useState<string>("")
    const [estadoNombre, setEstadoNombre] = useState<string>("Pendiente")

    // Estado de Items
    const [items, setItems] = useState<ItemOrden[]>([])
    const [idsDetallesOriginales, setIdsDetallesOriginales] = useState<number[]>([])
    const [universoItemsOriginales, setUniversoItemsOriginales] = useState<any[]>([])

    // Financieros
    const [montoRealOrdenCalculado, setMontoRealOrdenCalculado] = useState<number>(0)
    const [facturaTotal, setFacturaTotal] = useState<number>(0)
    const [notasCreditoTotal, setNotasCreditoTotal] = useState<number>(0)

    const [paginaActual, setPaginaActual] = useState(1)
    const ITEMS_POR_PAGINA = 5

    const esEditable = estadoNombre === "Pendiente" && !isReadOnlyParam
    const permiteFacturasBoton = estadoNombre === "Emitido" || estadoNombre === "Completado"

    useEffect(() => {
        if (!idOrden) {
            notify.error("Error", "ID de orden de compra no válido.")
            router.push("/compras/ordenes")
            return
        }

        const cargarDatosOrden = async () => {
            setIsLoadingData(true)
            try {
                const resOrdenes = await ordenesCompraAPI.getAll(1, 1000)
                const listaOrdenes = resOrdenes.items || resOrdenes || []
                const ordenActual = listaOrdenes.find((o: any) => Number(o.idOrdenCompra || o.id) === idOrden)

                if (!ordenActual) {
                    notify.error("No encontrado", "No se encontró la orden de compra solicitada.")
                    router.push("/compras/ordenes")
                    return
                }

                const cotizacionId = Number(ordenActual.idPedidoCotizacion || 0)
                setIdPedidoCotizacion(cotizacionId)
                setIdProveedor(ordenActual.idProveedor)

                const estadoId = ordenActual.idEstado || 1
                setIdEstado(estadoId)
                setEstadoNombre(ESTADOS_MAP[estadoId] || `Estado #${estadoId}`)

                setFecha(ordenActual.fecha ? ordenActual.fecha.split("T")[0] : "")
                setDescripcion(ordenActual.descripcion || "")
                setProveedorNombre(ordenActual.proveedor?.razonSocial || ordenActual.razonSocial || `Proveedor #${ordenActual.idProveedor}`)

                const resFacturas = await FacturasCompraAPI.getAll(1, 2000)
                const listaFacturas: FacturaCompra[] = resFacturas.items || resFacturas || []
                const facturasAsociadas = listaFacturas.filter(f => Number(f.idOrdenCompra) === idOrden)

                let totalFacturado = 0
                facturasAsociadas.forEach(f => {
                    if (f.detalles) {
                        totalFacturado += f.detalles.reduce((acc, det) => acc + (det.totalNeto || 0), 0)
                    }
                })
                setFacturaTotal(totalFacturado)

                const resNC = await notasCreditosCompraAPI.getAll(1, 2000)
                const listaNC = resNC.items || resNC || []
                const idsFacturasAsociadas = facturasAsociadas.map(f => f.idFacturaCompra)
                const notasCreditoAsociadas = listaNC.filter((nc: any) => idsFacturasAsociadas.includes(Number(nc.idFacturaCompra)))

                const totalNC = notasCreditoAsociadas.reduce((acc: number, nc: any) => acc + Number(nc.total || 0), 0)
                setNotasCreditoTotal(totalNC)

                let mapaCotizacion: Record<number, { precio: number; descuento: number; descripcion: string; categoria: string }> = {}
                if (cotizacionId > 0) {
                    const resCotizDetalles = await cotizacionesDetallesAPI.getAll(1, 2000)
                    const listaCotizDetalles: any[] = resCotizDetalles.items || resCotizDetalles || []
                    const detallesDeCotizacion = listaCotizDetalles.filter((cd) => Number(cd.idPedidoCotizacion) === cotizacionId)

                    detallesDeCotizacion.forEach((cd) => {
                        mapaCotizacion[Number(cd.idProducto)] = {
                            precio: Number(cd.precioProducto || cd.precioUnitario || 0),
                            descuento: Number(cd.descuento || 0),
                            descripcion: cd.producto?.descripcion || cd.descripcionProducto || cd.descripcion || `Producto #${cd.idProducto}`,
                            categoria: cd.producto?.categoria?.descripcion || cd.categoria || "—"
                        }
                    })

                    setUniversoItemsOriginales(detallesDeCotizacion.map((cd) => ({
                        idProducto: Number(cd.idProducto),
                        descripcion: cd.producto?.descripcion || cd.descripcionProducto || cd.descripcion || `Producto #${cd.idProducto}`,
                        categoria: cd.producto?.categoria?.descripcion || cd.categoria || "—",
                        cantidad: Number(cd.cantidad || 0),
                        precio: Number(cd.precioProducto || cd.precioUnitario || 0),
                        descuento: Number(cd.descuento || 0)
                    })))
                }

                const resDetalles = await ordenesCompraDetallesAPI.getAll(1, 2000)
                const todosLosDetalles = resDetalles.items || resDetalles || []
                const detallesFiltrados = todosLosDetalles.filter((d: any) => Number(d.idOrdenCompra) === idOrden)

                const idsOriginales = detallesFiltrados.map((d: any) => Number(d.idOrdenCompraDetalle || d.id)).filter(Boolean)
                setIdsDetallesOriginales(idsOriginales)

                let acumuladorTotalOrden = 0
                const itemsMapeados: ItemOrden[] = detallesFiltrados.map((d: any) => {
                    const idProd = d.idProducto || d.productoId
                    const infoCotiz = mapaCotizacion[idProd] || {
                        precio: d.precioUnitario || d.precio || 0,
                        descuento: d.descuento || 0,
                        descripcion: d.producto?.descripcion || d.descripcionProducto || d.descripcion || `Producto #${idProd}`,
                        categoria: "—"
                    }

                    let cantFacturada = 0
                    facturasAsociadas.forEach(f => {
                        const det = f.detalles?.find(det => Number(det.idProducto) === idProd)
                        if (det) cantFacturada += Number(det.cantidad || 0)
                    })

                    let cantDevuelta = 0
                    notasCreditoAsociadas.forEach((nc: any) => {
                        const det = nc.detalles?.find((det: any) => Number(det.idProducto) === idProd)
                        if (det) cantDevuelta += Number(det.cantidad || 0)
                    })

                    const entregadoTotal = Math.max(0, cantFacturada - cantDevuelta)
                    const subtotalItemReal = (infoCotiz.precio - infoCotiz.descuento) * Number(d.cantidad || 0)
                    acumuladorTotalOrden += subtotalItemReal

                    return {
                        idOrdenCompraDetalle: Number(d.idOrdenCompraDetalle || d.id || 0),
                        idProducto: idProd,
                        descripcion: infoCotiz.descripcion,
                        categoria: infoCotiz.categoria,
                        cantidad: Number(d.cantidad || 0),
                        precioUnitario: infoCotiz.precio,
                        descuento: infoCotiz.descuento,
                        entregado: entregadoTotal,
                        total: subtotalItemReal
                    }
                })

                setItems(itemsMapeados)
                setMontoRealOrdenCalculado(acumuladorTotalOrden)

            } catch (error) {
                console.error(error)
                notify.error("Error", "No se pudieron procesar los datos del servidor.")
            } finally {
                setIsLoadingData(false)
            }
        }

        cargarDatosOrden()
    }, [idOrden, router])

    const recalcularTotalesFlujo = (lineasActuales: ItemOrden[]) => {
        const nuevoTotal = lineasActuales.reduce((acc, item) => acc + item.total, 0)
        setMontoRealOrdenCalculado(nuevoTotal)
    }

    const handleConfirmarSeleccionModal = (productosSeleccionadosDelModal: any[]) => {
        const nuevosItems: ItemOrden[] = productosSeleccionadosDelModal.map((prodModal) => {
            const existente = items.find((i) => i.idProducto === prodModal.idProducto)
            if (existente) return existente

            const originalUniverso = universoItemsOriginales.find((u) => u.idProducto === prodModal.idProducto)
            const precioBase = originalUniverso ? originalUniverso.precio : (prodModal.precio || 0)
            const descuentoBase = originalUniverso ? originalUniverso.descuento : 0
            const cantidadInicial = prodModal.cantidadOriginal || 1

            return {
                idOrdenCompraDetalle: 0,
                idProducto: prodModal.idProducto,
                descripcion: prodModal.descripcion,
                categoria: prodModal.categoria,
                cantidad: cantidadInicial,
                precioUnitario: precioBase,
                descuento: descuentoBase,
                entregado: 0,
                total: (precioBase - descuentoBase) * cantidadInicial
            }
        })
        setItems(nuevosItems)
        setPaginaActual(1)
        recalcularTotalesFlujo(nuevosItems)
        notify.success("Tabla Sincronizada", "Líneas preparadas.")
    }

    const handleCambiarCantidad = (idProducto: number, nuevaCantidad: number) => {
        if (!esEditable || nuevaCantidad < 1) return

        const itemsActualizados = items.map(item => {
            if (item.idProducto !== idProducto) return item
            return {
                ...item,
                cantidad: nuevaCantidad,
                total: (item.precioUnitario - item.descuento) * nuevaCantidad
            }
        })
        setItems(itemsActualizados)
        recalcularTotalesFlujo(itemsActualizados)
    }

    const handleEliminarItem = (idProducto: number) => {
        if (!esEditable) return
        const itemsFiltrados = items.filter(item => item.idProducto !== idProducto)
        setItems(itemsFiltrados)
        recalcularTotalesFlujo(itemsFiltrados)
    }

    const handleGuardarCambios = async () => {
        if (!esEditable) return
        if (items.length === 0) {
            notify.error("Validación", "Debes incluir por lo menos un ítem en la orden.")
            return
        }

        setIsProcesando(true)
        try {
            const cabeceraPayload: OrdenCompraSaveDTO = {
                idPedidoCotizacion, idProveedor, idEstado, fecha, descripcion
            }
            await ordenesCompraAPI.update(idOrden!, cabeceraPayload)

            const idsQueSeQuedan = items.map(i => i.idOrdenCompraDetalle).filter(id => id > 0)
            const idsAEliminar = idsDetallesOriginales.filter(idOriginal => !idsQueSeQuedan.includes(idOriginal))

            if (idsAEliminar.length > 0) {
                await Promise.all(idsAEliminar.map(id => ordenesCompraDetallesAPI.delete(id)))
            }

            const promesasDetalles = items.map((item) => {
                const detallePayload: OrdenCompraDetalleSaveDTO = {
                    idOrdenCompraDetalle: item.idOrdenCompraDetalle,
                    idOrdenCompra: idOrden!,
                    idProducto: item.idProducto,
                    cantidad: item.cantidad
                }

                if (item.idOrdenCompraDetalle > 0) {
                    return ordenesCompraDetallesAPI.update(item.idOrdenCompraDetalle, detallePayload)
                } else {
                    return ordenesCompraDetallesAPI.create(detallePayload)
                }
            })

            await Promise.all(promesasDetalles)

            notify.success("Éxito", "Orden de compra guardada sin duplicados.")
            router.push("/compras/ordenes")
        } catch (error: any) {
            console.error(error)
            notify.error("Error al guardar", "Fallo de consistencia con el servidor.")
        } finally {
            setIsProcesando(false)
        }
    }

    const cuantoYaSeObtuvo = facturaTotal - notasCreditoTotal
    const cuantoFalta = montoRealOrdenCalculado - cuantoYaSeObtuvo

    const totalPaginas = Math.ceil(items.length / ITEMS_POR_PAGINA)
    const indiceInicial = (paginaActual - 1) * ITEMS_POR_PAGINA
    const itemsPaginados = items.slice(indiceInicial, indiceInicial + ITEMS_POR_PAGINA)

    return (
        <div className="bg-background w-full max-h-screen overflow-hidden flex flex-col">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Órdenes de Compra", href: "/compras/ordenes" },
                    { label: esEditable ? `Editar #${idOrden}` : `Visualizar #${idOrden}` },
                ]}
            />

            <main className="w-full px-4 pb-2 flex-1 flex flex-col space-y-2 overflow-hidden">
                {/* CONTROL SUPERIOR CON ALTURA REDUCIDA */}
                <div className="flex items-center justify-between py-1 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight">
                            {esEditable ? `Editar Orden #${idOrden}` : `Visualizar Orden #${idOrden}`}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-xs font-semibold border text-[10px] uppercase ${estadoNombre === "Pendiente" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-100 text-blue-800 border-blue-300"
                            }`}>
                            {estadoNombre}
                        </span>
                        {permiteFacturasBoton && (
                            <Button
                                variant="outline" size="sm"
                                onClick={() => router.push(`/compras/facturas?idOrdenCompra=${idOrden}`)}
                                className="flex gap-1 h-7 text-xs border-primary/30 text-primary cursor-pointer"
                            >
                                <Receipt className="h-3 w-3" /> Facturas
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => router.push("/compras/ordenes")} disabled={isProcesando} className="flex gap-1 h-7 text-xs cursor-pointer">
                            <ArrowLeft className="h-3 w-3" /> Volver
                        </Button>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="flex flex-col items-center justify-center flex-1 space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Estructurando interfaz...</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col space-y-2 overflow-hidden">

                        {/* 1. INPUTS DE CABECERA (PROVEEDOR, FECHA, OBSERVACIÓN) */}
                        <Card className="shadow-xs border-l-2 border-l-primary bg-background shrink-0">
                            <CardContent className="p-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <FieldWrapper label="Proveedor" id="proveedor">
                                    <Input
                                        value={proveedorNombre}
                                        disabled
                                        className="h-8 bg-muted/40 font-semibold text-xs border-muted-foreground/10 w-full truncate"
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Fecha de Registro" id="fecha">
                                    <Input
                                        type="date"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        disabled={!esEditable || isProcesando}
                                        className="h-8 text-xs"
                                    />
                                </FieldWrapper>

                                <FieldWrapper label="Observación / Descripción" id="descripcion">
                                    <Input
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        disabled={!esEditable || isProcesando}
                                        className="h-8 text-xs truncate"
                                        placeholder="Detalles..."
                                    />
                                </FieldWrapper>
                            </CardContent>
                        </Card>

                        {/* SOLUCIÓN: CARD DE MONTOS EN UNA SOLA LÍNEA HORIZONTAL Y ULTRA DELGADA */}
                        <Card className="bg-muted/15 shadow-xs border shrink-0">
                            <div className="flex flex-row items-center justify-between px-4 py-1.5 gap-6 text-xs font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Monto Orden:</span>
                                    <span className="font-bold text-blue-600 text-sm">{montoRealOrdenCalculado.toLocaleString("es-PY")} Gs.</span>
                                </div>

                                <div className="w-px h-4 bg-border" /> {/* Separador visual */}

                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Facturado:</span>
                                    <span className="font-semibold text-emerald-600">{cuantoYaSeObtuvo.toLocaleString("es-PY")} Gs.</span>
                                </div>

                                <div className="w-px h-4 bg-border" /> {/* Separador visual */}

                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Saldo:</span>
                                    <span className="font-bold text-foreground">
                                        {cuantoFalta <= 0 ? 0 : cuantoFalta.toLocaleString("es-PY")} Gs.
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* TABLA DE PRODUCTOS EN ALTO CONTENIDO AJUSTABLE */}
                        <Card className="shadow-xs flex-1 flex flex-col overflow-hidden">
                            <div className="bg-muted/30 py-1.5 px-3 flex items-center justify-between border-b shrink-0">
                                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                                    Artículos en la Orden ({items.length})
                                </span>
                                {esEditable && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsModalOpen(true)}
                                        className="h-6 text-xs gap-1 font-semibold text-primary border-primary/20 hover:bg-primary/5 cursor-pointer"
                                    >
                                        <ListPlus className="h-3 w-3" /> Ajustar Ítems
                                    </Button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10 shadow-xs">
                                        <TableRow className="bg-muted/5">
                                            <TableHead className="text-xs font-bold py-1.5">Producto</TableHead>
                                            <TableHead className="w-20 text-center text-xs font-bold py-1.5">Cantidad</TableHead>
                                            <TableHead className="w-20 text-center text-xs font-bold py-1.5">Entregado</TableHead>
                                            <TableHead className="text-right text-xs font-bold py-1.5">Precio</TableHead>
                                            <TableHead className="text-right text-xs font-bold py-1.5">Desc.</TableHead>
                                            <TableHead className="text-right text-xs font-bold py-1.5">Subtotal</TableHead>
                                            {esEditable && <TableHead className="w-10 py-1.5"></TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itemsPaginados.map((item) => (
                                            <TableRow key={item.idProducto} className="text-xs hover:bg-muted/5">
                                                <TableCell className="font-medium max-w-[280px] truncate py-1">{item.descripcion}</TableCell>
                                                <TableCell className="text-center py-1">
                                                    <Input
                                                        type="number"
                                                        className={`h-6 w-14 mx-auto text-center text-xs p-0.5 ${!esEditable ? "bg-transparent border-none shadow-none font-semibold" : ""}`}
                                                        value={item.cantidad}
                                                        min={1}
                                                        onChange={(e) => handleCambiarCantidad(item.idProducto, Number(e.target.value))}
                                                        disabled={!esEditable || isProcesando}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center py-1">
                                                    <span className={`px-1.5 py-0.2 rounded-full font-bold text-[9px] ${item.entregado >= item.cantidad ? "bg-emerald-100 text-emerald-800" : item.entregado > 0 ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}>
                                                        {item.entregado}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right py-1">
                                                    {item.precioUnitario.toLocaleString("es-PY")}
                                                </TableCell>
                                                <TableCell className="text-right text-destructive py-1">
                                                    {item.descuento > 0 ? `-${item.descuento.toLocaleString("es-PY")}` : "0"}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-primary py-1">
                                                    {item.total.toLocaleString("es-PY")}
                                                </TableCell>
                                                {esEditable && (
                                                    <TableCell className="text-center py-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5 text-destructive hover:bg-destructive/10 cursor-pointer"
                                                            onClick={() => handleEliminarItem(item.idProducto)}
                                                            disabled={isProcesando}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                        {items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={esEditable ? 7 : 6} className="text-center py-4 text-muted-foreground text-xs">
                                                    No hay artículos en la orden actual.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* PAGINACIÓN COMPACTA PINNED AL BORDE INFERIOR */}
                            {totalPaginas > 1 && (
                                <div className="flex items-center justify-between p-1.5 border-t bg-muted/5 shrink-0">
                                    <p className="text-[10px] text-muted-foreground">
                                        {indiceInicial + 1} al {Math.min(indiceInicial + ITEMS_POR_PAGINA, items.length)} de {items.length} ítems
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
                                            <ChevronLeft className="h-3 w-3" />
                                        </Button>
                                        <span className="text-[10px] font-medium px-1">Pág. {paginaActual} / {totalPaginas}</span>
                                        <Button variant="outline" size="icon" className="h-5 w-5" onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* CONTROL DE GUARDADO INFERIOR */}
                        <div className="flex justify-end gap-2 pt-0.5 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => router.push("/compras/ordenes")} disabled={isProcesando} className="h-7 text-xs cursor-pointer">
                                {esEditable ? "Cancelar" : "Volver"}
                            </Button>

                            {esEditable && (
                                <Button size="sm" onClick={handleGuardarCambios} disabled={isProcesando} className="flex gap-1 h-7 text-xs shadow-xs cursor-pointer">
                                    {isProcesando ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3 w-3" /> Confirmar Cambios
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <SeleccionarItemsPedidoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                detallesPedido={universoItemsOriginales}
                itemsSeleccionados={items}
                onConfirm={handleConfirmarSeleccionModal}
            />
        </div>
    )
}

export default function EditarOrdenPage() {
    return (
        <Suspense fallback={null}>
            <EditarOrdenPageContent />
        </Suspense>
    )
}
