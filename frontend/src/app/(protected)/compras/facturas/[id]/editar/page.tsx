"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Save, CreditCard, Edit3, ChevronLeft, ChevronRight, Trash2, ListPlus } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { cotizacionesDetallesAPI } from "@/services/cotizacionesDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"
import { cn } from "@/lib/utils"
import { SeleccionarItemsPedidoModal } from "@/components/compras/seleccionar-items-pedidoModal"
import { CotizacionDetalleDTO } from "@/types/types"

export interface ItemFacturaForm {
    idProducto: number
    descripcion: string
    cantidadPedida: number
    cantidadFacturadaPrevia: number
    cantidadRestante: number
    descuentoUnitarioBase: number
    cantidadRecibidaAhora: number
    precioUnitario: number
    descuento: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

export interface FacturaCompra {
    idFacturaCompra: number
    idProveedor: number
    proveedor: string
    idOrdenCompra?: number
    ordenCompraDescripcion?: string
    nroComprobante: string
    timbrado: string
    fecha: string
    idEstado: number
    estado: string
    descripcion?: string
    detalles?: any[]
}

const ITEMS_PER_PAGE = 5

function FacturaDetalleContent() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params?.id ? String(params.id) : ""
    const [isViewMode, setIsViewMode] = useState(false);

    const [factura, setFactura] = useState<FacturaCompra | null>(null)
    const [idEstado, setIdEstado] = useState<number>(1)
    const [nroComprobante, setNroComprobante] = useState<string>("")
    const [timbrado, setTimbrado] = useState<string>("")
    const [fecha, setFecha] = useState<string>("")
    const [descripcion, setDescripcion] = useState<string>("")

    // Universo completo de productos de la OC y los ítems agregados a la factura
    const [productosDisponibles, setProductosDisponibles] = useState<ItemFacturaForm[]>([])
    const [itemsFactura, setItemsFactura] = useState<ItemFacturaForm[]>([])

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(1)

    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)


    // Recuperador iterativo de facturas para calcular remanentes reales
    const recuperarTodasLasFacturas = async (): Promise<any[]> => {
        let todas: any[] = []
        let pagina = 1
        const tamanoPagina = 50
        let tieneMas = true
        while (tieneMas) {
            try {
                const res = await FacturasCompraAPI.getAll(pagina, tamanoPagina)
                const items = res?.items || []
                todas = [...todas, ...items]
                if (items.length < tamanoPagina || !items.length) {
                    tieneMas = false
                } else {
                    pagina++
                }
            } catch (error) {
                console.error("Error en paginación de facturas", error)
                tieneMas = false
            }
        }
        return todas
    }

    // Formateador de comprobantes idéntico a la carga
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

    // Carga inicial y reconstrucción del estado dinámico del formulario
    useEffect(() => {
        if (!id) return

        const fetchDetallesYCruzar = async () => {
            try {
                setIsLoading(true)
                const data = (await FacturasCompraAPI.getById(Number(id))) as unknown as FacturaCompra
                setFactura(data)
                setIdEstado(data.idEstado || 1)
                setNroComprobante(data.nroComprobante || "")
                setTimbrado(data.timbrado || "")
                setDescripcion(data.descripcion || "")
                if (data.fecha) {
                    setFecha(new Date(data.fecha).toISOString().split('T')[0])
                }

                if (data.idOrdenCompra) {
                    const idOC = String(data.idOrdenCompra)

                    const [resOrdenCompleta, resTodasLasCotizaciones, resTodasLasFacturas] = await Promise.all([
                        ordenesCompraAPI.getById(idOC),
                        cotizacionesDetallesAPI.getAll(1, 500),
                        recuperarTodasLasFacturas()
                    ])

                    const detallesOC: any[] = resOrdenCompleta.detalles || []
                    const idCotizacionGanadora = resOrdenCompleta.idPedidoCotizacion
                    const todasLasCotizaciones: any = resTodasLasCotizaciones.items || resTodasLasCotizaciones || []

                    // Excluir la factura actual del cálculo para obtener lo facturado por OTROS comprobantes
                    const facturasPreviasAsociadas = resTodasLasFacturas.filter(
                        (f: any) => String(f.idOrdenCompra) === idOC &&
                            Number(f.idFacturaCompra || f.id) !== Number(id) &&
                            f.estado !== "Anulado"
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

                        // Cantidad procesada por OTRAS facturas distintas a la actual
                        const cantidadFacturadaPrevia = facturasPreviasAsociadas.reduce((acc, f) => {
                            const de = f.detalles?.find((d: any) => d.idProducto === detOC.idProducto)
                            return acc + (de ? de.cantidad : 0)
                        }, 0)

                        // El remanente real disponible para esta edición es: Pedido - Lo de otras facturas
                        const cantidadRestante = Math.max(0, cantidadPedida - cantidadFacturadaPrevia)
                        const descuentoUnitarioBase = cantidadPedida > 0 ? (descuentoTotalOC / cantidadPedida) : 0

                        // Encontrar si este producto ya estaba guardado en la factura que estamos editando
                        const itemGuardadoEnFactura = data.detalles?.find((d: any) => d.idProducto === detOC.idProducto)
                        const cantidadRecibidaAhora = itemGuardadoEnFactura ? itemGuardadoEnFactura.cantidad : 0

                        const totalBruto = cantidadRecibidaAhora * precioUnitario
                        const descuentoProporcional = cantidadRecibidaAhora * descuentoUnitarioBase
                        const totalNeto = totalBruto - descuentoProporcional
                        const totalIva = Math.round(totalNeto / 11)

                        return {
                            idProducto: detOC.idProducto,
                            descripcion: detOC.producto?.descripcion || detOC.descripcion || `Producto #${detOC.idProducto}`,
                            cantidadPedida,
                            cantidadFacturadaPrevia,
                            cantidadRestante, // Techo disponible real para modificar en este comprobante
                            descuentoUnitarioBase,
                            cantidadRecibidaAhora,
                            precioUnitario,
                            descuento: descuentoProporcional,
                            totalBruto,
                            totalIva,
                            totalNeto
                        }
                    })

                    setProductosDisponibles(mapeoDisponibles)
                    // Inicializar los ítems que activamente pertenecen a la factura actual
                    setItemsFactura(mapeoDisponibles.filter(p => p.cantidadRecibidaAhora > 0))
                }
            } catch (err) {
                console.error(err)
                notify.error("Error", "No se pudo obtener el contexto de edición de la factura.")
                router.push("/compras/facturas")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetallesYCruzar()
    }, [id, router])



    useEffect(() => {
        const viewParam = searchParams.get("view") === "true" || searchParams.has("view");
        const esPendiente = factura?.estado?.toUpperCase() !== "PENDIENTE";

        // Si factura está cargada (o ya llegó de la API), evaluamos el estado
        if (factura) {
            setIsViewMode(viewParam || esPendiente);
        } else {
            // Si aún no carga la factura, solo dependemos del parámetro URL
            setIsViewMode(viewParam);
        }
    }, [searchParams, factura]);

    // Prevenir desbordes de páginas locales al borrar ítems de la grilla
    const totalPages = Math.ceil(itemsFactura.length / ITEMS_PER_PAGE)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages)
        }
    }, [itemsFactura.length, totalPages, currentPage])

    const handleConfirmarSeleccionModal = (seleccionados: any[]) => {
        const idsSeleccionados = new Set(seleccionados.map(s => s.idProducto))

        setItemsFactura(prev => {
            const conservados = prev.filter(item => idsSeleccionados.has(item.idProducto))
            const nuevosIds = seleccionados.filter(s => !prev.some(item => item.idProducto === s.idProducto))

            const agregados = productosDisponibles
                .filter(p => nuevosIds.some(n => n.idProducto === p.idProducto))
                .map(p => ({
                    ...p,
                    cantidadRecibidaAhora: p.cantidadRestante, // Por defecto inicializa con su saldo completo
                    totalBruto: p.cantidadRestante * p.precioUnitario
                }))

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

        setItemsFactura(prev => [...prev, ...itemsAñadibles.map(p => ({ ...p, cantidadRecibidaAhora: p.cantidadRestante }))])
        notify.success("Carga Masiva", `Se agregaron ${itemsAñadibles.length} ítems a la factura.`)
    }

    const handleRemoverItemFactura = (idProd: number) => {
        setItemsFactura(prev => prev.filter(item => item.idProducto !== idProd))
    }

    const handleCantidadFacturadaChange = (globalIndex: number, nuevaCant: number) => {
        setItemsFactura(prev => prev.map((item, i) => {
            if (i !== globalIndex) return item

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

    const handleGuardarCambios = async () => {
        if (!nroComprobante || !timbrado || !fecha) {
            return notify.error("Campos Requeridos", "Por favor completa el comprobante, timbrado y la fecha de emisión.")
        }

        if (nroComprobante.length < 15) {
            return notify.error("Formato Inválido", "El número de comprobante debe cumplir el formato: 001-001-0000001")
        }

        if (itemsFactura.length === 0) {
            return notify.error("Factura Vacía", "Debes seleccionar al menos un producto para registrar en la factura.")
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

        setIsSaving(true)
        try {
            const idFacturaOriginal = factura?.idFacturaCompra || Number(id)
            const fechaFormateada = new Date(fecha + 'T00:00:00').toISOString().split('T')[0]

            const facturaPayload = {
                idOrdenCompra: factura?.idOrdenCompra || 0,
                idProveedor: factura?.idProveedor || 0,
                nroComprobante: nroComprobante,
                timbrado: timbrado,
                fecha: fechaFormateada,
                descripcion: descripcion,
                idEstado: Number(idEstado),
                detalles: itemsFactura.map(item => ({
                    idFacturaCompra: idFacturaOriginal,
                    idProducto: item.idProducto,
                    cantidad: item.cantidadRecibidaAhora,
                    precioUnitario: item.precioUnitario,
                    totalBruto: item.totalBruto,
                    totalIva: item.totalIva,
                    totalNeto: item.totalNeto
                }))
            }

            await FacturasCompraAPI.update(idFacturaOriginal, facturaPayload)

            let totalPedidoGlobal = 0
            let totalFacturadoGlobal = 0

            productosDisponibles.forEach(prod => {
                totalPedidoGlobal += prod.cantidadPedida
                const itemEnFacturaActual = itemsFactura.find(it => it.idProducto === prod.idProducto)
                const cantAhora = itemEnFacturaActual ? itemEnFacturaActual.cantidadRecibidaAhora : 0
                totalFacturadoGlobal += (prod.cantidadFacturadaPrevia + cantAhora)
            })

            const nuevoEstadoOrden = (idEstado === 3)
                ? "Emitido"
                : (totalFacturadoGlobal >= totalPedidoGlobal ? "Completado" : "Emitido")

            if (factura?.idOrdenCompra) {
                try {
                    await ordenesCompraAPI.updateEstado(String(factura.idOrdenCompra), { estado: nuevoEstadoOrden })
                } catch (stateError) {
                    console.warn("Comprobante editado pero la OC no pudo actualizar su estado:", stateError)
                }
            }

            notify.success("Modificación Exitosa", "Comprobante de compra actualizado correctamente.")
            router.push("/compras/facturas")
        } catch (err) {
            console.error(err)
            notify.error("Error", "Ocurrió un error al procesar los cambios de la factura.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleIrAPagar = () => {
        if (!factura) return
        router.push(`/compras/pagos/pagar`)
    }

    // Para el modal, queremos mostrar cualquier producto de la OC que tenga saldo libre para usar
    // O que pertenezca a la lista de ítems actualmente seleccionados en la pantalla.
    const productosParaModal = productosDisponibles.filter(prod =>
        prod.cantidadRestante > 0 || itemsFactura.some(item => item.idProducto === prod.idProducto)
    )

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const itemsPaginados = itemsFactura.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="bg-background w-full">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Facturas", href: "/compras/facturas" },
                    { label: isViewMode ? `Comprobante: ${factura?.nroComprobante || id}` : `Modificar: ${nroComprobante}` }
                ]}
            />

            <main className="w-full">
                {/* Cabecera, Títulos y Botones de acción igual */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                    <h5 className="font-bold tracking-tight">
                        {isViewMode ? `Comprobante Asentado: ${nroComprobante}` : "Modificar Comprobante de Compra"}
                    </h5>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isViewMode && factura?.estado?.toUpperCase() && factura?.estado?.toUpperCase() !== "ANULADO" && (
                            <Button variant="default" size="sm" onClick={handleIrAPagar} className="">
                                <CreditCard className="h-4 w-4" /> Pagar Factura
                            </Button>
                        )}

                        {isViewMode && factura?.estado?.toUpperCase() === "PENDIENTE" && (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/compras/facturas/${factura?.idFacturaCompra || id}/editar`)} className="gap-1">
                                <Edit3 className="h-4 w-4" /> Editar Datos
                            </Button>
                        )}

                        {!isViewMode && (
                            <Button variant="default" size="sm" onClick={handleGuardarCambios} disabled={isSaving} className="gap-1.5">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Cambios
                            </Button>
                        )}

                        <Button variant="outline" size="sm" onClick={() => router.push("/compras/facturas")} className="gap-1">
                            <ArrowLeft className="h-4 w-4" /> Volver al listado
                        </Button>
                    </div>
                </div>

                {/* Formulario Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 border p-2 rounded-lg bg-card w-full shadow-sm">
                    <div>
                        <FieldWrapper label="Orden de Compra Origen" id="soOC">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50 font-medium"
                                value={factura?.idOrdenCompra ? `OC #${factura.idOrdenCompra} — ${factura?.ordenCompraDescripcion || 'Origen'}` : "OC sin especificar"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div>
                        <FieldWrapper label="Proveedor" id="txtProv">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50 font-medium"
                                value={factura?.proveedor || "No especificado"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div>
                        <FieldWrapper label="Número de Comprobante" id="txtComp">
                            <Input
                                className={cn("h-9 text-xs w-full font-mono tracking-wider", isViewMode ? 'bg-muted/50' : 'bg-background')}
                                value={nroComprobante}
                                onChange={handleNroComprobanteChange}
                                placeholder="001-001-0000001"
                                disabled={isViewMode}
                            />
                        </FieldWrapper>
                    </div>

                    <div>
                        <FieldWrapper label="Número de Timbrado" id="txtTimb">
                            <Input
                                className={cn("h-9 text-xs w-full font-mono", isViewMode ? 'bg-muted/50' : 'bg-background')}
                                value={timbrado}
                                onChange={(e) => setTimbrado(e.target.value.replace(/\D/g, ""))}
                                maxLength={8}
                                placeholder="12345678"
                                disabled={isViewMode}
                            />
                        </FieldWrapper>
                    </div>

                    <div>
                        <FieldWrapper label="Fecha de Emisión" id="txtFech">
                            <Input
                                type="date"
                                className={cn("h-9 text-xs w-full", isViewMode ? 'bg-muted/50' : 'bg-background')}
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                disabled={isViewMode}
                            />
                        </FieldWrapper>
                    </div>

                    <div>
                        <FieldWrapper label="Estado de Factura" id="txtEstado">
                            {isViewMode ? (
                                <span className={cn(
                                    "inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-bold w-full border",
                                    factura?.estado?.toUpperCase() === 'APROBADO' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                    factura?.estado?.toUpperCase() === 'ANULADO' && 'bg-destructive/10 text-destructive border-destructive/20',
                                    factura?.estado?.toUpperCase() === 'PENDIENTE' && 'bg-amber-50 text-amber-700 border-amber-200'
                                )}>
                                    {factura?.estado?.toUpperCase()}
                                </span>
                            ) : (
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={idEstado}
                                    onChange={(e) => setIdEstado(Number(e.target.value))}
                                >
                                    <option value={1}>PENDIENTE</option>
                                    <option value={2}>APROBADO</option>
                                    <option value={3}>ANULADO</option>
                                </select>
                            )}
                        </FieldWrapper>
                    </div>
                </div>

                {/* Controles del Modal */}
                {!isViewMode && factura?.idOrdenCompra && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border p-2 rounded-lg bg-muted/20 mb-2 w-full">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 text-xs bg-background font-semibold shadow-sm border-primary/30 hover:border-primary text-primary hover:bg-primary/5"
                                onClick={() => setIsModalOpen(true)}
                                disabled={isSaving}
                            >
                                <ListPlus className="h-4 w-4" /> Seleccionar Productos ({itemsFactura.length}/{productosParaModal.length})
                            </Button>

                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-9 gap-1 text-xs"
                                onClick={handleCargarTodosLosItems}
                                disabled={isSaving || itemsFactura.length === productosParaModal.length}
                            >
                                Cargar pendientes
                            </Button>
                        </div>
                    </div>
                )}

                {/* Tabla Dinámica de ítems */}
                {itemsFactura.length > 0 ? (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full flex flex-col mb-4">
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
                                    {!isViewMode && <TableHead className="w-16 text-center"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itemsPaginados.map((item, index) => {
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
                                                {isViewMode ? (
                                                    <span className="text-xs font-mono font-semibold text-muted-foreground">{item.cantidadRecibidaAhora}</span>
                                                ) : (
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
                                                        disabled={isSaving}
                                                    />
                                                )}
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
                                            {!isViewMode && (
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                        onClick={() => handleRemoverItemFactura(item.idProducto)}
                                                        disabled={isSaving}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>

                        {/* Paginador simple de la tabla */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-end gap-2 p-2 border-t bg-muted/20 text-xs">
                                <span className="text-muted-foreground">Página {currentPage} de {totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-card text-center shadow-sm w-full mb-4">
                        <span className="text-sm font-medium text-muted-foreground mb-1">No hay productos en esta factura</span>
                        <p className="text-xs text-muted-foreground/70 max-w-xs">Usa el botón de arriba para seleccionar ítems pendientes de la Orden de Compra.</p>
                    </div>
                )}

                {/* Footer de totales */}
                <div className="border rounded-lg bg-card p-3 shadow-sm flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 w-full">
                    <div className="text-xs text-muted-foreground w-full sm:w-auto">
                        {descripcion ? (
                            <p><span className="font-semibold">Obs:</span> {descripcion}</p>
                        ) : (
                            <p className="italic">Sin observaciones adicionales.</p>
                        )}
                    </div>
                    <div className="flex items-center gap-6 justify-end w-full sm:w-auto">
                        <div className="text-right">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Liquidación IVA</span>
                            <span className="text-sm font-semibold font-mono text-muted-foreground">{totalFacturaIva.toLocaleString("es-PY")} Gs.</span>
                        </div>
                        <div className="text-right border-l pl-6">
                            <span className="block text-[10px] uppercase font-bold tracking-wider text-primary font-bold">Total Neto</span>
                            <span className="text-xl font-bold font-mono text-foreground">{totalFacturaNeto.toLocaleString("es-PY")} Gs.</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de Selección */}
            <SeleccionarItemsPedidoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                itemsSeleccionados={itemsFactura}
                onConfirm={handleConfirmarSeleccionModal}
                detallesPedido={productosParaModal.map(p => ({
                    idProducto: p.idProducto,
                    descripcion: p.descripcion,
                    cantidad: p.cantidadRestante, // El saldo total que puede tomar esta factura
                    categoria: "—"
                }))}
            />
        </div>
    )
}

export default function FacturaDetallePage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <FacturaDetalleContent />
        </Suspense>
    )
}