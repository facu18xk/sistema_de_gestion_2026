"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Check, ChevronsUpDown, Trash2, ListPlus, ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { OrdenCompraDTO, CotizacionDetalleDTO } from "@/types/types"
import { FacturaCompraSaveDTO } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal"

interface ItemFacturaForm {
    idProducto: number
    descripcion: string
    cantidadPedida: number
    cantidadFacturadaPrevia: number
    cantidadRestante: number // Remanente máximo permitido
    descuentoUnitarioBase: number // Base estática para evitar errores de redondeo continuo
    cantidadRecibidaAhora: number
    precioUnitario: number
    descuento: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

const ITEMS_PER_PAGE = 5

export default function CargarFacturaPage() {
    const router = useRouter()
    const [ordenes, setOrdenes] = useState<OrdenCompraDTO[]>([])
    const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<string>("")
    const [openCombo, setOpenCombo] = useState<boolean>(false)

    // Control del Modal de Selección de Ítems
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    const [nroComprobante, setNroComprobante] = useState<string>("")
    const [timbrado, setTimbrado] = useState<string>("")
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0])
    const [descripcion, setDescripcion] = useState<string>("")

    // Universo completo de productos de la OC seleccionada
    const [productosDisponibles, setProductosDisponibles] = useState<ItemFacturaForm[]>([])
    // Ítems añadidos explícitamente a la factura actual
    const [itemsFactura, setItemsFactura] = useState<ItemFacturaForm[]>([])

    // Estado para la paginación de la tabla
    const [currentPage, setCurrentPage] = useState<number>(1)

    const [isLoadingOrdenes, setIsLoadingOrdenes] = useState<boolean>(true)
    const [isProcesando, setIsProcesando] = useState<boolean>(false)

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const res = await ordenesCompraAPI.getAll(1, 100)
                const lista: OrdenCompraDTO[] = res.items || res || []
                setOrdenes(lista.filter((o) => o.estado !== "Completado" && o.estado !== "Facturado"))
            } catch (err) {
                notify.error("Error", "No se pudieron obtener las órdenes de compra.")
            } finally {
                setIsLoadingOrdenes(false)
            }
        }
        fetchOrdenes()
    }, [])

    // Control preventivo para evitar desbordes de página al remover ítems
    const totalPages = Math.ceil(itemsFactura.length / ITEMS_PER_PAGE)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages)
        }
    }, [itemsFactura.length, totalPages, currentPage])

    const formatNroComprobante = (value: string) => {
        const nums = value.replace(/\D/g, "")
        const digits = nums.slice(0, 13)
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    }

    const handleNroComprobanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNroComprobante(e.target.value)
        setNroComprobante(formatted)
    }

    const handleSeleccionarOrden = async (idOC: string) => {
        setIdOrdenSeleccionada(idOC)
        setItemsFactura([])
        setProductosDisponibles([])
        setCurrentPage(1)
        if (!idOC) return

        try {
            const ordenDoc = ordenes.find(o => String(o.idOrdenCompra) === String(idOC))
            if (!ordenDoc) return

            const idCotizacionGanadora = ordenDoc.idPedidoCotizacion

            const [resOrdenCompleta, resTodasLasCotizaciones, resTodasLasFacturas] = await Promise.all([
                ordenesCompraAPI.getById(idOC),
                cotizacionesDetallesAPI.getAll(1, 500),
                FacturasCompraAPI.getAll(1, 1000)
            ])

            const detallesOC: any[] = resOrdenCompleta.detalles || []
            const todasLasCotizaciones: any = resTodasLasCotizaciones.items || resTodasLasCotizaciones || []
            const todasLasFacturas: any[] = resTodasLasFacturas.items || resTodasLasFacturas || []

            const facturasPreviasAsociadas = todasLasFacturas.filter(
                (f: any) => String(f.idOrdenCompra) === String(idOC) && f.estado !== "Anulado"
            )

            const detallesCotizFiltrados: CotizacionDetalleDTO[] = todasLasCotizaciones.filter(
                (c: CotizacionDetalleDTO) => c.idPedidoCotizacion === idCotizacionGanadora
            )

            const mapeoDisponibles: ItemFacturaForm[] = detallesOC.map((detOC) => {
                const coincidenciaCotizacion = detallesCotizFiltrados.find(
                    (c) => c.idProducto === detOC.idProducto
                )

                const precioUnitario = coincidenciaCotizacion ? coincidenciaCotizacion.precioProducto : 0
                const descuentoTotalOC = coincidenciaCotizacion ? ((coincidenciaCotizacion as any).descuento || 0) : 0
                const cantidadPedida = detOC.cantidad || 0

                const cantidadFacturadaPrevia = facturasPreviasAsociadas.reduce((acc, f) => {
                    const de = f.detalles?.find((d: any) => d.idProducto === detOC.idProducto)
                    return acc + (de ? de.cantidad : 0)
                }, 0)

                const cantidadRestante = Math.max(0, cantidadPedida - cantidadFacturadaPrevia)
                const descuentoUnitarioBase = cantidadPedida > 0 ? (descuentoTotalOC / cantidadPedida) : 0

                const totalBruto = cantidadRestante * precioUnitario
                const descuentoProporcional = cantidadRestante * descuentoUnitarioBase
                const totalNeto = totalBruto - descuentoProporcional
                const totalIva = Math.round(totalNeto / 11)

                return {
                    idProducto: detOC.idProducto,
                    descripcion: detOC.producto?.descripcion || detOC.descripcion || `Producto #${detOC.idProducto}`,
                    cantidadPedida,
                    cantidadFacturadaPrevia,
                    cantidadRestante,
                    descuentoUnitarioBase,
                    cantidadRecibidaAhora: cantidadRestante,
                    precioUnitario,
                    descuento: descuentoProporcional,
                    totalBruto,
                    totalIva,
                    totalNeto
                }
            })

            setProductosDisponibles(mapeoDisponibles)
            setDescripcion(`Facturación parcial/total de la OC #${idOC}`)
        } catch (err) {
            console.error(err)
            notify.error("Error de Cruce", "Fallo al procesar las facturas previas y las cotizaciones.")
        }
    }

    const handleConfirmarSeleccionModal = (seleccionados: any[]) => {
        const idsSeleccionados = new Set(seleccionados.map(s => s.idProducto))

        setItemsFactura(prev => {
            const conservados = prev.filter(item => idsSeleccionados.has(item.idProducto))
            const nuevosIds = seleccionados.filter(s => !prev.some(item => item.idProducto === s.idProducto))

            const agregados = productosDisponibles
                .filter(p => nuevosIds.some(n => n.idProducto === p.idProducto))
                .map(p => ({ ...p }))

            return [...conservados, ...agregados]
        })
    }

    const handleCargarTodosLosItems = () => {
        const itemsAñadibles = productosDisponibles.filter(
            prod => !itemsFactura.some(item => item.idProducto === prod.idProducto) && prod.cantidadRestante > 0
        )

        if (itemsAñadibles.length === 0) {
            return notify.success("Carga Completa", "Todos los productos con remanente ya están en la lista.")
        }

        setItemsFactura(prev => [...prev, ...itemsAñadibles.map(p => ({ ...p }))])
        notify.success("Carga Masiva", `Se agregaron ${itemsAñadibles.length} ítems a la factura.`)
    }

    const handleRemoverItemFactura = (idProd: number) => {
        setItemsFactura(prev => prev.filter(item => item.idProducto !== idProd))
    }

    const handleCantidadFacturadaChange = (index: number, nuevaCant: number) => {
        setItemsFactura(prev => prev.map((item, i) => {
            if (i !== index) return item

            const cant = Math.max(0, nuevaCant)
            const totalBruto = cant * item.precioUnitario
            const descuentoProporcional = cant * item.descuentoUnitarioBase
            const totalNeto = totalBruto - descuentoProporcional
            const totalIva = Math.round(totalNeto / 11)

            return {
                ...item,
                cantidadRecibidaAhora: cant,
                totalBruto,
                descuento: descuentoProporcional,
                totalNeto,
                totalIva
            }
        }))
    }

    const totalFacturaNeto = itemsFactura.reduce((acc, item) => acc + item.totalNeto, 0)
    const totalFacturaIva = itemsFactura.reduce((acc, item) => acc + item.totalIva, 0)

    const handleGuardarFactura = async () => {
        if (!idOrdenSeleccionada || !nroComprobante || !timbrado) {
            return notify.error("Campos Requeridos", "Por favor completa el comprobante, timbrado y la orden origen.")
        }

        if (nroComprobante.length < 15) {
            return notify.error("Formato Inválido", "El número de comprobante debe cumplir el formato: 001-001-0000001")
        }

        if (itemsFactura.length === 0) {
            return notify.error("Factura Vacía", "Debes seleccionar al menos un producto para asentar en la factura.")
        }

        const tieneCantidadesEnCero = itemsFactura.some(item => item.cantidadRecibidaAhora <= 0)
        if (tieneCantidadesEnCero) {
            return notify.error("Cantidad Inválida", "Todos los productos agregados deben poseer una cantidad superior a 0.")
        }

        const itemExcedido = itemsFactura.find(item => item.cantidadRecibidaAhora > item.cantidadRestante)
        if (itemExcedido) {
            return notify.error(
                "Cantidad Excedida",
                `El producto "${itemExcedido.descripcion}" supera el remanente disponible (${itemExcedido.cantidadRestante} unidades).`
            )
        }

        setIsProcesando(true)
        try {
            const ordenDoc = ordenes.find(o => String(o.idOrdenCompra) === String(idOrdenSeleccionada))
            const idProveedorFinal = ordenDoc ? ordenDoc.idProveedor : 0
            const fechaFormateada = new Date(fecha + 'T00:00:00').toISOString().split('T')[0]

            const facturaPayload: FacturaCompraSaveDTO = {
                idOrdenCompra: Number(idOrdenSeleccionada),
                idProveedor: idProveedorFinal,
                nroComprobante: nroComprobante,
                timbrado: timbrado,
                fecha: fechaFormateada,
                descripcion: descripcion,
                idEstado: 1,
                detalles: itemsFactura.map(item => ({
                    idProducto: item.idProducto,
                    cantidad: item.cantidadRecibidaAhora,
                    precioUnitario: item.precioUnitario,
                    totalBruto: item.totalBruto,
                    totalIva: item.totalIva,
                    totalNeto: item.totalNeto
                }))
            }

            console.log(facturaPayload)
            await FacturasCompraAPI.create(facturaPayload)

            let totalPedidoGlobal = 0
            let totalFacturadoGlobal = 0

            productosDisponibles.forEach(prod => {
                totalPedidoGlobal += prod.cantidadPedida
                const itemEnFacturaActual = itemsFactura.find(it => it.idProducto === prod.idProducto)
                const cantAhora = itemEnFacturaActual ? itemEnFacturaActual.cantidadRecibidaAhora : 0
                totalFacturadoGlobal += (prod.cantidadFacturadaPrevia + cantAhora)
            })

            const nuevoEstadoOrden = totalFacturadoGlobal >= totalPedidoGlobal ? "Completado" : "Emitido"

            try {
                await ordenesCompraAPI.updateEstado(idOrdenSeleccionada, { estado: nuevoEstadoOrden })
            } catch (stateError) {
                console.warn("La factura se guardó pero la OC no pudo actualizar su estado:", stateError)
            }

            notify.success("Operación Exitosa", `Factura asentada correctamente. Orden de compra actualizada a: ${nuevoEstadoOrden}.`)
            router.push("/compras/facturas")
        } catch (err) {
            console.error(err)
            notify.error("Error", "Ocurrió un error al procesar el cierre integrado de la factura.")
        } finally {
            setIsProcesando(false)
        }
    }

    const ordenSeleccionadaActual = ordenes.find(o => String(o.idOrdenCompra) === String(idOrdenSeleccionada))
    const productosConRemanente = productosDisponibles.filter(prod => prod.cantidadRestante > 0)

    // Cálculos de segmentación para la paginación local
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const itemsPaginados = itemsFactura.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return (
        <div className="bg-background w-full">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Facturas", href: "/compras/facturas" }, { label: "Cargar" }]} />

            <main className="w-full">
                <div className="flex items-center justify-between mb-2">
                    <h5 className="text-2xl font-bold tracking-tight">Registrar Factura de Proveedor</h5>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/facturas")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>

                {/* Cabecera del Formulario */}
                <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 items-end mb-2 border p-2 rounded-lg bg-card w-full">
                    <div className="flex-1 min-w-[280px]">
                        <FieldWrapper label="Orden de Compra Origen" id="soOC">
                            <Popover open={openCombo} onOpenChange={setOpenCombo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombo}
                                        className="w-full h-9 justify-between text-xs font-normal px-3 bg-background"
                                        disabled={isProcesando || isLoadingOrdenes}
                                    >
                                        {ordenSeleccionadaActual
                                            ? `OC #${ordenSeleccionadaActual.idOrdenCompra} — ${ordenSeleccionadaActual.proveedor}`
                                            : "Buscar por OC, RUC o Proveedor..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[380px] p-0" align="start">
                                    <Command filter={(value, search) => {
                                        const target = value.toLowerCase()
                                        const term = search.toLowerCase()
                                        return target.includes(term) ? 1 : 0
                                    }} >
                                        <CommandInput placeholder="Ingresa Nro. OC, Nombre o RUC..." className="h-8 text-xs" />
                                        <CommandList>
                                            <CommandEmpty className="p-2 text-xs text-muted-foreground text-center">
                                                No se encontraron Gastro-coincidencias.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {ordenes.map((o) => {
                                                    const rucProveedor = (o as any).ruc || ""
                                                    const valorDeBusqueda = `oc-${o.idOrdenCompra} ${o.proveedor} ${rucProveedor}`.toLowerCase()

                                                    return (
                                                        <CommandItem
                                                            key={o.idOrdenCompra}
                                                            value={valorDeBusqueda}
                                                            onSelect={() => {
                                                                handleSeleccionarOrden(String(o.idOrdenCompra))
                                                                setOpenCombo(false)
                                                            }}
                                                            className="text-xs flex items-center justify-between cursor-pointer"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">OC #{o.idOrdenCompra}</span>
                                                                <span className="text-muted-foreground text-[11px]">
                                                                    {o.proveedor} {rucProveedor ? `(${rucProveedor})` : ""}
                                                                </span>
                                                            </div>
                                                            <Check
                                                                className={cn(
                                                                    "h-4 w-4 text-primary",
                                                                    idOrdenSeleccionada === String(o.idOrdenCompra) ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <FieldWrapper label="Nro. Comprobante Factura" id="txtComp">
                            <Input
                                placeholder="001-001-0001234"
                                className="h-9 text-xs w-full font-mono tracking-wider"
                                value={nroComprobante}
                                onChange={handleNroComprobanteChange}
                                disabled={isProcesando}
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <FieldWrapper label="Número de Timbrado" id="txtTimb">
                            <Input
                                placeholder="16743210"
                                className="h-9 text-xs w-full"
                                value={timbrado}
                                onChange={(e) => setTimbrado(e.target.value.replace(/\D/g, ""))}
                                disabled={isProcesando}
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                        <FieldWrapper label="Fecha de Factura" id="txtFech">
                            <Input
                                type="date"
                                className="h-9 text-xs w-full"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                disabled={isProcesando}
                            />
                        </FieldWrapper>
                    </div>
                </div>

                {/* Selector de ítems usando Modal */}
                {idOrdenSeleccionada && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border p-2 rounded-lg bg-muted/20 mb-2 w-full">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 text-xs bg-background font-semibold shadow-sm border-primary/30 hover:border-primary text-primary hover:bg-primary/5"
                                onClick={() => setIsModalOpen(true)}
                                disabled={isProcesando}
                            >
                                <ListPlus className="h-4 w-4" /> Seleccionar Productos ({itemsFactura.length}/{productosConRemanente.length})
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-9 gap-1 text-xs"
                                onClick={handleCargarTodosLosItems}
                                disabled={isProcesando || itemsFactura.length === productosConRemanente.length}
                            >
                                Cargar pendientes
                            </Button>
                        </div>

                        <span className="text-xs text-muted-foreground italic">

                        </span>
                    </div>
                )}

                {/* Tabla de Factura Dinámica con Paginación integrada */}
                {idOrdenSeleccionada && itemsFactura.length > 0 && (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full mb-6">
                        <Table className="w-full">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Producto / Descripción</TableHead>
                                    <TableHead className="w-24 text-center">Cant. OC</TableHead>
                                    <TableHead className="w-24 text-center">Remanente</TableHead>
                                    <TableHead className="w-28 text-center">A Facturar ahora</TableHead>
                                    <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                                    <TableHead className="w-24 text-right">Descuento</TableHead>
                                    <TableHead className="w-32 text-right">Total Neto</TableHead>
                                    <TableHead className="w-16 text-center"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsPaginados.map((item, index) => {
                                    // Calculamos el índice real absoluto en el array completo de ítems
                                    const globalIndex = startIndex + index
                                    const esInvalido = item.cantidadRecibidaAhora > item.cantidadRestante || item.cantidadRecibidaAhora <= 0

                                    return (
                                        <TableRow
                                            key={item.idProducto}
                                            className={cn("hover:bg-muted/10", esInvalido && "bg-destructive/10 hover:bg-destructive/15")}
                                        >
                                            <TableCell className="text-xs font-medium">
                                                {item.descripcion}
                                            </TableCell>
                                            <TableCell className="text-xs text-center text-muted-foreground">
                                                {item.cantidadPedida}
                                            </TableCell>
                                            <TableCell className="text-xs text-center font-semibold text-primary">
                                                {item.cantidadRestante}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={item.cantidadRestante}
                                                    className={cn(
                                                        "h-7 text-xs text-center w-20 mx-auto",
                                                        esInvalido && "border-destructive text-destructive focus-visible:ring-destructive"
                                                    )}
                                                    value={item.cantidadRecibidaAhora}
                                                    onChange={(e) => handleCantidadFacturadaChange(globalIndex, Number(e.target.value))}
                                                    disabled={isProcesando}
                                                />
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-mono">
                                                {item.precioUnitario.toLocaleString("es-PY")} Gs.
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-mono text-destructive">
                                                {item.descuento > 0 ? `-${Math.round(item.descuento).toLocaleString("es-PY")}` : "0"}
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-bold font-mono text-foreground">
                                                {item.totalNeto.toLocaleString("es-PY")} Gs.
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                    onClick={() => handleRemoverItemFactura(item.idProducto)}
                                                    disabled={isProcesando}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {/* Controles de Paginación locales */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-1 border-t bg-card text-xs text-muted-foreground">
                                <div>
                                    Mostrando <span className="font-medium text-foreground">{startIndex + 1}</span> al{" "}
                                    <span className="font-medium text-foreground">
                                        {Math.min(startIndex + ITEMS_PER_PAGE, itemsFactura.length)}
                                    </span>{" "}
                                    de <span className="font-medium text-foreground">{itemsFactura.length}</span> productos
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1 || isProcesando}
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                                    </Button>
                                    <span className="min-w-[40px] text-center font-medium text-foreground">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || isProcesando}
                                    >
                                        Siguiente <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="p-2 bg-muted/30 flex flex-col items-end border-t gap-1.5 text-xs w-full">
                            <div className="text-muted-foreground">
                                Liquidación IVA (10% inc.): <span className="font-mono font-medium text-foreground">{totalFacturaIva.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            <div className="text-sm font-bold text-primary">
                                Total General Factura: <span className="font-mono text-sm">{totalFacturaNeto.toLocaleString("es-PY")} Gs.</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de Acción Final del Formulario */}
                {idOrdenSeleccionada && (
                    <div className="flex justify-end gap-3 mt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/compras/facturas")}
                            disabled={isProcesando}
                            className="h-9 text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleGuardarFactura}
                            disabled={isProcesando}
                            className="h-9 text-xs gap-1.5 shadow-sm font-semibold"
                        >
                            {isProcesando ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Guardar Factura
                        </Button>
                    </div>
                )}
            </main>

            {/* Renderizado del Modal de Selección */}
            <SeleccionarItemsPedidoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                itemsSeleccionados={itemsFactura}
                onConfirm={handleConfirmarSeleccionModal}
                detallesPedido={productosConRemanente.map(p => ({
                    idProducto: p.idProducto,
                    descripcion: p.descripcion,
                    cantidad: p.cantidadRestante,
                    categoria: "—"
                }))}
            />
        </div>
    )
}