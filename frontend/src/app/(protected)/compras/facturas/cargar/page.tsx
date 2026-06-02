"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Check, ChevronsUpDown, ExternalLink } from "lucide-react"
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

interface ItemFacturaForm {
    idProducto: number
    descripcion: string
    cantidadPedida: number
    cantidadFacturadaPrevia: number // Control de acumulados anteriores
    cantidadRecibidaAhora: number
    precioUnitario: number
    descuento: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

export default function CargarFacturaPage() {
    const router = useRouter()
    const [ordenes, setOrdenes] = useState<OrdenCompraDTO[]>([])
    const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<string>("")
    const [openCombo, setOpenCombo] = useState<boolean>(false)
    const [nroComprobante, setNroComprobante] = useState<string>("")
    const [timbrado, setTimbrado] = useState<string>("")
    const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0])
    const [descripcion, setDescripcion] = useState<string>("")
    const [itemsFactura, setItemsFactura] = useState<ItemFacturaForm[]>([])
    const [isLoadingOrdenes, setIsLoadingOrdenes] = useState<boolean>(true)
    const [isProcesando, setIsProcesando] = useState<boolean>(false)

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const res = await ordenesCompraAPI.getAll(1, 100)
                const lista: OrdenCompraDTO[] = res.items || res || []
                // Filtrar órdenes que no estén completamente liquidadas/completadas
                setOrdenes(lista.filter((o) => o.estado !== "Completado" && o.estado !== "Facturado"))
            } catch (err) {
                notify.error("Error", "No se pudieron obtener las órdenes de compra.")
            } finally {
                setIsLoadingOrdenes(false)
            }
        }
        fetchOrdenes()
    }, [])

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
        if (!idOC) {
            setItemsFactura([])
            return
        }

        try {
            const ordenDoc = ordenes.find(o => String(o.idOrdenCompra) === String(idOC))
            if (!ordenDoc) return

            const idCotizacionGanadora = ordenDoc.idPedidoCotizacion

            // Traemos los detalles de la OC, cotizaciones e historial de facturas para calcular remanentes
            const [resOrdenCompleta, resTodasLasCotizaciones, resTodasLasFacturas] = await Promise.all([
                ordenesCompraAPI.getById(idOC),
                cotizacionesDetallesAPI.getAll(1, 500),
                FacturasCompraAPI.getAll(1, 1000)
            ])

            const detallesOC: any[] = resOrdenCompleta.detalles || []
            const todasLasCotizaciones: any = resTodasLasCotizaciones.items || resTodasLasCotizaciones || []
            const todasLasFacturas: any[] = resTodasLasFacturas.items || resTodasLasFacturas || []

            // Filtrar facturas vigentes vinculadas a esta misma OC
            const facturasPreviasAsociadas = todasLasFacturas.filter(
                (f: any) => String(f.idOrdenCompra) === String(idOC) && f.estado !== "Anulado"
            )

            const detallesCotizFiltrados: CotizacionDetalleDTO[] = todasLasCotizaciones.filter(
                (c: CotizacionDetalleDTO) => c.idPedidoCotizacion === idCotizacionGanadora
            )

            const itemsMapeados: ItemFacturaForm[] = detallesOC.map((detOC) => {
                const coincidenciaCotizacion = detallesCotizFiltrados.find(
                    (c) => c.idProducto === detOC.idProducto
                )

                const precioUnitario = coincidenciaCotizacion ? coincidenciaCotizacion.precioProducto : 0
                const descuentoTotalOC = coincidenciaCotizacion ? ((coincidenciaCotizacion as any).descuento || 0) : 0
                const cantidadPedida = detOC.cantidad || 0

                // Cálculo de lo ya facturado en el pasado para este producto específico
                const cantidadFacturadaPrevia = facturasPreviasAsociadas.reduce((acc, f) => {
                    const de = f.detalles?.find((d: any) => d.idProducto === detOC.idProducto)
                    return acc + (de ? de.cantidad : 0)
                }, 0)

                // El remanente sugerido para recibir ahora de forma predeterminada
                const cantidadRestante = Math.max(0, cantidadPedida - cantidadFacturadaPrevia)

                const totalBruto = cantidadRestante * precioUnitario
                // Proporcional del descuento basado en lo que queda por facturar
                const descuentoProporcional = cantidadPedida > 0 ? (descuentoTotalOC / cantidadPedida) * cantidadRestante : 0
                const totalNeto = totalBruto - descuentoProporcional
                const totalIva = Math.round(totalNeto / 11)

                return {
                    idProducto: detOC.idProducto,
                    descripcion: detOC.producto?.descripcion || detOC.descripcion || `Producto #${detOC.idProducto}`,
                    cantidadPedida,
                    cantidadFacturadaPrevia,
                    cantidadRecibidaAhora: cantidadRestante,
                    precioUnitario,
                    descuento: descuentoProporcional,
                    totalBruto,
                    totalIva,
                    totalNeto
                }
            })

            setItemsFactura(itemsMapeados)
            setDescripcion(`Facturación de la OC #${idOC}`)
        } catch (err) {
            console.error(err)
            notify.error("Error de Cruce", "Fallo al procesar las facturas previas y las cotizaciones.")
        }
    }

    const handleCantidadFacturadaChange = (index: number, nuevaCant: number) => {
        setItemsFactura(prev => prev.map((item, i) => {
            if (i !== index) return item

            const cant = Math.max(0, nuevaCant)
            const totalBruto = cant * item.precioUnitario

            // Recalcular descuento e IVA proporcional
            const descuentoOriginalTotal = item.cantidadPedida > 0 ? (item.descuento / (item.cantidadRecibidaAhora || 1)) * item.cantidadRecibidaAhora : 0
            const descuentoProporcional = item.cantidadPedida > 0 ? (descuentoOriginalTotal / item.cantidadPedida) * cant : 0

            const totalNeto = totalBruto - descuentoProporcional
            const totalIva = Math.round(totalNeto / 11)

            return {
                ...item,
                cantidadRecibidaAhora: cant,
                totalBruto,
                totalIva,
                totalNeto
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
            return notify.error("Formato Inválido", "El número de comprobante debe tener el formato completo: 001-001-0000001")
        }

        // VALIDACIÓN: Verificar por cada detalle que no exceda la orden de compra entregable
        const itemExcedido = itemsFactura.find(
            item => item.cantidadRecibidaAhora > (item.cantidadPedida - item.cantidadFacturadaPrevia)
        )
        if (itemExcedido) {
            const disponibleMax = itemExcedido.cantidadPedida - itemExcedido.cantidadFacturadaPrevia
            return notify.error(
                "Cantidad Excedida",
                `El producto "${itemExcedido.descripcion}" supera el remanente disponible de la Orden (${disponibleMax} unidades).`
            )
        }

        const totalItemsFacturados = itemsFactura.reduce((acc, item) => acc + item.cantidadRecibidaAhora, 0)
        if (totalItemsFacturados === 0) {
            return notify.error("Operación Inválida", "La factura debe contener al menos 1 producto con cantidad mayor a 0.")
        }

        setIsProcesando(true)
        try {
            const ordenDoc = ordenes.find(o => String(o.idOrdenCompra) === String(idOrdenSeleccionada))
            const idProveedorFinal = ordenDoc ? ordenDoc.idProveedor : 0
            const fechaFormateada = new Date(fecha + 'T00:00:00').toISOString().split('T')[0]

            // Construcción del Payload Único Transaccional (Cabecera + Detalles + Estado inicial)
            const facturaPayload: FacturaCompraSaveDTO = {
                idOrdenCompra: Number(idOrdenSeleccionada),
                idProveedor: idProveedorFinal,
                nroComprobante: nroComprobante,
                timbrado: timbrado,
                fecha: fechaFormateada,
                descripcion: descripcion,
                estado: "Pendiente", // Al crearse inicia en "Pendiente" y permite modificaciones
                detalles: itemsFactura
                    .filter(item => item.cantidadRecibidaAhora > 0)
                    .map(item => ({
                        idProducto: item.idProducto,
                        cantidad: item.cantidadRecibidaAhora,
                        precioUnitario: item.precioUnitario,
                        totalBruto: item.totalBruto,
                        totalIva: item.totalIva,
                        totalNeto: item.totalNeto
                    }))
            }

            // 1. Envío unificado al backend
            await FacturasCompraAPI.create(facturaPayload)

            // 2. Cálculo lógico del nuevo estado de la Orden de Compra
            let totalPedidoGlobal = 0
            let totalFacturadoGlobal = 0

            itemsFactura.forEach(item => {
                totalPedidoGlobal += item.cantidadPedida
                totalFacturadoGlobal += (item.cantidadFacturadaPrevia + item.cantidadRecibidaAhora)
            })

            // Condición: Si cubre todo es "Completado", sino pasa a o se mantiene en "Emitido"
            const nuevoEstadoOrden = totalFacturadoGlobal >= totalPedidoGlobal ? "Completado" : "Emitido"

            try {
                await ordenesCompraAPI.updateEstado(idOrdenSeleccionada, { estado: nuevoEstadoOrden })
            } catch (stateError) {
                console.warn("La factura se guardó pero la OC no pudo cambiar su estado:", stateError)
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

    return (
        <div className="bg-background w-full">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Facturas", href: "/compras/facturas" }, { label: "Cargar" }]} />

            <main className="w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Registrar Factura de Proveedor</h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/facturas")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>

                <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 items-end mb-4 border p-4 rounded-lg bg-card w-full">
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
                                                No se encontraron coincidencias.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {ordenes.map((o) => {
                                                    const rucProveedor = (o as any).ruc || ""
                                                    const valorDeBusqueda = `oc-${o.idOrdenCompra} ${o.proveedor} ${rucProveedor}`

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


                {idOrdenSeleccionada && (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full">
                        <Table className="w-full">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Producto / Descripción</TableHead>
                                    <TableHead className="w-24 text-center">Cant. OC</TableHead>
                                    <TableHead className="w-24 text-center">Facturado Previo</TableHead>
                                    <TableHead className="w-28 text-center">Cant. A Facturar</TableHead>
                                    <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                                    <TableHead className="w-24 text-right">Descuento</TableHead>
                                    <TableHead className="w-32 text-right">Total Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsFactura.map((item, index) => {
                                    const disponibleMax = item.cantidadPedida - item.cantidadFacturadaPrevia
                                    const esInvalido = item.cantidadRecibidaAhora > disponibleMax

                                    return (
                                        <TableRow
                                            key={item.idProducto}
                                            className={cn("hover:bg-muted/10", esInvalido && "bg-destructive/10 hover:bg-destructive/15")}
                                        >
                                            <TableCell className="text-xs font-medium">
                                                {item.descripcion}
                                            </TableCell>
                                            <TableCell className="text-xs text-center text-muted-foreground font-semibold">
                                                {item.cantidadPedida}
                                            </TableCell>
                                            <TableCell className="text-xs text-center text-muted-foreground">
                                                {item.cantidadFacturadaPrevia}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Input
                                                    type="number"
                                                    className={cn(
                                                        "h-7 text-xs text-center w-20 mx-auto",
                                                        esInvalido && "border-destructive text-destructive focus-visible:ring-destructive"
                                                    )}
                                                    value={item.cantidadRecibidaAhora}
                                                    onChange={(e) => handleCantidadFacturadaChange(index, Number(e.target.value))}
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
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        <div className="p-4 bg-muted/30 flex flex-col items-end border-t gap-1.5 text-xs w-full">
                            <div className="text-muted-foreground">
                                Liquidación IVA (10% inc.): <span className="font-mono font-medium text-foreground">{totalFacturaIva.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            <div className="text-sm font-bold text-primary">
                                Total General Factura: <span className="font-mono text-lg">{totalFacturaNeto.toLocaleString("es-PY")} Gs.</span>
                            </div>
                        </div>
                    </div>
                )}

                {idOrdenSeleccionada && (
                    <div className="flex justify-end mt-6 w-full">
                        <Button
                            size="sm"
                            onClick={handleGuardarFactura}
                            disabled={isProcesando || itemsFactura.length === 0}
                            className="gap-2"
                        >
                            {isProcesando ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando Lote...</>
                            ) : (
                                <><Save className="h-4 w-4" /> Registrar Factura Completa</>
                            )}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}