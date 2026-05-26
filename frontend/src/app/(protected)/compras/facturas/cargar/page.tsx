"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { facturasCompraDetallesAPI } from "@/services/facturasCompraDetallesAPI"
import { OrdenCompraDTO, CotizacionDetalleDTO } from "@/types/types"
import { FacturaCompraSaveDTO } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"

interface ItemFacturaForm {
    idProducto: number
    descripcion: string
    cantidadPedida: number
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
                setOrdenes(lista.filter((o) => o.estado !== "Facturado"))
            } catch (err) {
                notify.error("Error", "No se pudieron obtener las órdenes de compra.")
            } finally {
                setIsLoadingOrdenes(false)
            }
        }
        fetchOrdenes()
    }, [])

    // Formateador dinámico para el número de comprobante (001-001-0000001)
    const formatNroComprobante = (value: string) => {
        // Deja solo los dígitos numéricos
        const nums = value.replace(/\D/g, "")

        // Corta el exceso si pegan un string muy largo (máximo 13 dígitos)
        const digits = nums.slice(0, 13)

        if (digits.length <= 3) {
            return digits
        }
        if (digits.length <= 6) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`
        }
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

            const [resOrdenCompleta, resTodasLasCotizaciones] = await Promise.all([
                ordenesCompraAPI.getById(idOC),
                cotizacionesDetallesAPI.getAll(1, 500)
            ])

            const detallesOC: any[] = resOrdenCompleta.detalles || []
            const todasLasCotizaciones: any = resTodasLasCotizaciones.items || resTodasLasCotizaciones || []

            const detallesCotizFiltrados: CotizacionDetalleDTO[] = todasLasCotizaciones.filter(
                (c: CotizacionDetalleDTO) => c.idPedidoCotizacion === idCotizacionGanadora
            )

            const itemsMapeados: ItemFacturaForm[] = detallesOC.map((detOC) => {
                const coincidenciaCotizacion = detallesCotizFiltrados.find(
                    (c) => c.idProducto === detOC.idProducto
                )

                const coincindex = !!coincidenciaCotizacion;
                const precioUnitario = coincidenciaCotizacion ? coincidenciaCotizacion.precioProducto : 0
                const descuento = coincidenciaCotizacion ? ((coincidenciaCotizacion as any).descuento || 0) : 0;
                const cantidad = detOC.cantidad || 0

                const totalBruto = cantidad * precioUnitario
                const netoSinDescuento = totalBruto - descuento
                const totalIva = Math.round(netoSinDescuento / 11)
                const totalNeto = netoSinDescuento

                return {
                    idProducto: detOC.idProducto,
                    descripcion: detOC.producto?.descripcion || detOC.descripcion || `Producto #${detOC.idProducto}`,
                    cantidadPedida: cantidad,
                    cantidadRecibidaAhora: cantidad,
                    precioUnitario: precioUnitario,
                    descuento: descuento,
                    totalBruto: totalBruto,
                    totalIva: totalIva,
                    totalNeto: totalNeto
                }
            })

            setItemsFactura(itemsMapeados)
            setDescripcion(`Facturación de la OC #${idOC}`)
        } catch (err) {
            console.error(err)
            notify.error("Error de Cruce", "Fallo al procesar el listado y sus cotizaciones.")
        }
    }

    const handleCantidadFacturadaChange = (index: number, nuevaCant: number) => {
        setItemsFactura(prev => prev.map((item, i) => {
            if (i !== index) return item

            // Limitamos que visualmente no meta valores negativos, pero dejamos que escriba libremente para la validación final
            const cant = Math.max(0, nuevaCant)
            const totalBruto = cant * item.precioUnitario
            const descuentoProporcional = item.cantidadPedida > 0 ? (item.descuento / item.cantidadPedida) * cant : 0
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

        // Validación estricta del formato del comprobante (Debe cumplir 15 caracteres incluyendo guiones)
        if (nroComprobante.length < 15) {
            return notify.error("Formato Inválido", "El número de comprobante debe tener el formato completo: 001-001-0000001")
        }

        // VALIDACIÓN: Verificar que ninguna cantidad cargada supere lo pedido originalmente
        const itemExcedido = itemsFactura.find(item => item.cantidadRecibidaAhora > item.cantidadPedida)
        if (itemExcedido) {
            return notify.error(
                "Cantidad Excedida",
                `El producto "${itemExcedido.descripcion}" supera la cantidad disponible en la Orden de Compra (${itemExcedido.cantidadPedida}).`
            )
        }

        // VALIDACIÓN: Evitar guardar facturas vacías en 0 unidades
        const totalItemsFacturados = itemsFactura.reduce((acc, item) => acc + item.cantidadRecibidaAhora, 0)
        if (totalItemsFacturados === 0) {
            return notify.error("Operación Inválida", "La factura debe contener al menos 1 producto con cantidad mayor a 0.")
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
                descripcion: descripcion
            }

            // 1. Mandamos la cabecera
            const nuevaFactura: any = await FacturasCompraAPI.create(facturaPayload)
            const idFacturaGenerada = nuevaFactura?.idFacturaCompra || nuevaFactura?.id

            if (!idFacturaGenerada) {
                throw new Error("El backend no retornó un ID válido para la cabecera de la factura.")
            }

            // Filtrar para registrar solo ítems cuya cantidad cargada sea mayor a cero (Facturación parcial compatible)
            const itemsFiltradosParaGuardar = itemsFactura.filter(item => item.cantidadRecibidaAhora > 0)

            // 2. Guardamos el lote de detalles filtrados
            const promesasDetalles = itemsFiltradosParaGuardar.map(item => {
                return facturasCompraDetallesAPI.createDetalle({
                    idFacturaCompra: idFacturaGenerada,
                    idProducto: item.idProducto,
                    cantidad: item.cantidadRecibidaAhora,
                    precioUnitario: item.precioUnitario,
                    totalBruto: item.totalBruto,
                    totalIva: item.totalIva,
                    totalNeto: item.totalNeto
                })
            })

            await Promise.all(promesasDetalles)

            // 3. Modificación del estado de la Orden de Compra basado en la cantidad global pendiente
            try {
                const totalPendiente = itemsFactura.reduce((acc, i) => acc + (i.cantidadPedida - i.cantidadRecibidaAhora), 0)
                const nuevoEstado = totalPendiente === 0 ? "Facturado" : "Pendiente de Entrega"
                await ordenesCompraAPI.updateEstado(idOrdenSeleccionada, { estado: nuevoEstado })
            } catch (stateError) {
                console.warn("La factura se guardó pero la OC no pudo cambiar su estado:", stateError)
            }

            notify.success("Operación Exitosa", "Factura asentada e ingresada al Stock de forma correcta.")
            router.push("/compras/facturas")
        } catch (err) {
            console.error(err)
            notify.error("Error", "Ocurrió un error al procesar el cierre de la factura.")
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

                <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 items-end mb-6 border p-4 rounded-lg bg-card w-full">
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
                                    }}>
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
                                    <TableHead className="w-28 text-center">Cant. A Facturar</TableHead>
                                    <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                                    <TableHead className="w-24 text-right">Descuento</TableHead>
                                    <TableHead className="w-32 text-right">Total Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsFactura.map((item, index) => {
                                    const esInvalido = item.cantidadRecibidaAhora > item.cantidadPedida
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
                                                {item.descuento > 0 ? `-${item.descuento.toLocaleString("es-PY")}` : "0"}
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
                                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando Stock...</>
                            ) : (
                                <><Save className="h-4 w-4" /> Registrar Factura e Ingresar</>
                            )}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}