"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { ordenesCompraDetallesAPI } from "@/services/ordenesCompraDetallesAPI"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { FacturasCompraDetallesAPI } from "@/services/facturasCompraDetallesAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/FieldWrapper"
import { FacturaCompraSaveDTO, FacturaCompraDetalleSaveDTO, FacturaCompra } from "@/types/types"

interface ItemOrden {
    idProducto: number
    descripcion: string
    cantidadSolicitada: number
    cantidadYaFacturada: number
    cantidadPendiente: number
    cantidadRecibidaAhora: number
    precioUnitario: number
    descuento: number
    totalItem: number
}

export default function CargarFacturaPage() {
    const router = useRouter()
    const [ordenesPendientes, setOrdenesPendientes] = useState<any[]>([])
    const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<string>("")

    const [nroComprobante, setNroComprobante] = useState<string>("")
    const [timbrado, setTimbrado] = useState<string>("")
    const [fechaFactura, setFechaFactura] = useState<string>(new Date().toISOString().split('T')[0])
    const [descripcionCabecera, setDescripcionCabecera] = useState<string>("")
    const [proveedorInfo, setProveedorInfo] = useState<{ id: number; razonSocial: string } | null>(null)

    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isProcesando, setIsProcesando] = useState(false)
    const [itemsFactura, setItemsFactura] = useState<ItemOrden[]>([])

    useEffect(() => {
        const cargarOrdenesPendientes = async () => {
            try {
                const resOC = await ordenesCompraAPI.getAll(1, 500)
                const lista = resOC.items || resOC || []
                setOrdenesPendientes(lista.filter((o: any) => o.estado === "Generada" || o.estado === "Pendiente de Entrega"))
            } catch (error) {
                notify.error("Error", "No se pudo mapear la lista de órdenes de compra pendientes.")
            }
        }
        cargarOrdenesPendientes()
    }, [])

    const handleSeleccionarOrden = async (idOrden: string) => {
        setIdOrdenSeleccionada(idOrden)
        if (!idOrden) {
            setItemsFactura([])
            setProveedorInfo(null)
            return
        }

        setIsLoadingData(true)
        try {
            const todasLasOC = await ordenesCompraAPI.getAll(1, 500)
            const listaOC = todasLasOC.items || todasLasOC || []
            const ocSeleccionada = listaOC.find((o: any) => String(o.idOrdenCompra) === String(idOrden))

            if (ocSeleccionada) {
                setProveedorInfo({
                    id: ocSeleccionada.idProveedor,
                    razonSocial: ocSeleccionada.proveedor?.razonSocial || `Proveedor #${ocSeleccionada.idProveedor}`
                })
                setDescripcionCabecera(`Factura asociada a la Orden de Compra #${idOrden}`)
            }

            const resDetalles = await ordenesCompraDetallesAPI.getAll(1, 2000)
            const listaDetalles = resDetalles.items || resDetalles || []
            const detallesDeOC = listaDetalles.filter((d: any) => String(d.idOrdenCompra) === String(idOrden))

            let facturasPreviasDetalles: any[] = []
            try {
                const resFacturas = await FacturasCompraDetallesAPI.getDetallesPorOrden(idOrden)
                facturasPreviasDetalles = resFacturas.items || resFacturas || []
            } catch (pErr) {
                console.warn("No se detectaron facturas previas cargadas para esta OC. Inicializando en 0.")
            }

            const itemsMapeados: ItemOrden[] = detallesDeOC.map((det: any) => {
                const idProd = det.idProducto
                const yaFacturado = facturasPreviasDetalles
                    .filter((fDet: any) => fDet.idProducto === idProd)
                    .reduce((acc: number, fDet: any) => acc + Number(fDet.cantidad), 0)

                const solicitado = Number(det.cantidad)
                const pendiente = solicitado - yaFacturado

                return {
                    idProducto: idProd,
                    descripcion: det.producto?.descripcion || det.descripcion || `Producto #${idProd}`,
                    cantidadSolicitada: solicitado,
                    cantidadYaFacturada: yaFacturado,
                    cantidadPendiente: pendiente > 0 ? pendiente : 0,
                    cantidadRecibidaAhora: pendiente > 0 ? pendiente : 0,
                    precioUnitario: Number(det.precioUnitario || det.precioProducto || 0),
                    descuento: Number(det.descuento || 0),
                    totalItem: 0
                }
            })

            const itemsConTotales = itemsMapeados.map(item => ({
                ...item,
                totalItem: (item.precioUnitario - item.descuento) * item.cantidadRecibidaAhora
            }))

            setItemsFactura(itemsConTotales)

            if (itemsConTotales.every(i => i.cantidadPendiente === 0)) {
                notify.error("OC Completa", "Todos los productos de esta orden de compra ya fueron facturados por completo.")
            }
        } catch (err) {
            console.error(err)
            notify.error("Error", "Error al procesar la trazabilidad de cantidades pendientes.")
        } finally {
            setIsLoadingData(false) // <-- Cambiado de declare a finally corregido
        }
    }

    const handleCantidadFacturadaChange = (idProducto: number, valor: number) => {
        setItemsFactura(prev =>
            prev.map(item => {
                if (item.idProducto !== idProducto) return item

                let cantidadValidada = valor
                if (cantidadValidada > item.cantidadPendiente) {
                    cantidadValidada = item.cantidadPendiente
                    notify.error("Límite excedido", `No se puede recibir más de la cantidad pendiente (${item.cantidadPendiente}).`)
                }
                if (cantidadValidada < 0) cantidadValidada = 0

                return {
                    ...item,
                    cantidadRecibidaAhora: cantidadValidada,
                    totalItem: (item.precioUnitario - item.descuento) * cantidadValidada
                }
            })
        )
    }

    const calcularTotalFactura = () => {
        return itemsFactura.reduce((acc, item) => acc + item.totalItem, 0)
    }

    const handleGuardarFactura = async () => {
        if (!idOrdenSeleccionada) return notify.error("Campos vacíos", "Debe seleccionar una Orden de Compra origen.")
        if (!nroComprobante.trim() || !timbrado.trim()) return notify.error("Campos vacíos", "El Número de Factura y el Timbrado son obligatorios.")

        const itemsAFacturar = itemsFactura.filter(item => item.cantidadRecibidaAhora > 0)
        if (itemsAFacturar.length === 0) {
            return notify.error("Sin ítems", "Debe ingresar al menos una cantidad mayor a 0 para generar la factura.")
        }

        setIsProcesando(true)
        try {
            const facturaPayload: FacturaCompraSaveDTO = {
                idOrdenCompra: Number(idOrdenSeleccionada),
                idProveedor: proveedorInfo?.id || 0,
                nroComprobante: nroComprobante,
                timbrado: timbrado,
                fecha: new Date(fechaFactura).toISOString(),
                descripcion: descripcionCabecera
            }

            const nuevaFacturaRes: any = await FacturasCompraAPI.create(facturaPayload)
            const idFacturaGenerada = nuevaFacturaRes?.idFacturaCompra || nuevaFacturaRes?.id

            if (!idFacturaGenerada) {
                throw new Error("El servidor no retornó un ID válido.")
            }

            const promesasDetalles = itemsAFacturar.map(item => {
                const totalBrutoCalculado = item.precioUnitario * item.cantidadRecibidaAhora
                const totalNetoCalculado = item.totalItem
                const totalIvaCalculado = totalNetoCalculado * 0.10

                const detallePayload: FacturaCompraDetalleSaveDTO = {
                    idFacturaCompra: idFacturaGenerada,
                    idProducto: item.idProducto,
                    cantidad: item.cantidadRecibidaAhora,
                    precioUnitario: item.precioUnitario,
                    totalBruto: totalBrutoCalculado,
                    totalIva: totalIvaCalculado,
                    totalNeto: totalNetoCalculado
                }
                return FacturasCompraDetallesAPI.createDetalle(detallePayload)
            })

            await Promise.all(promesasDetalles)

            const totalPendienteRestante = itemsFactura.reduce((acc, item) => {
                return acc + (item.idProducto ? (item.cantidadPendiente - item.cantidadRecibidaAhora) : 0)
            }, 0)

            const nuevoEstadoOC = totalPendienteRestante === 0 ? "Recibido Completado" : "Pendiente de Entrega"
            await ordenesCompraAPI.updateEstado(idOrdenSeleccionada, { estado: nuevoEstadoOC })

            notify.success("Carga Exitosa", `Factura ${nroComprobante} procesada correctamente.`)
            router.push("/compras/facturas")
        } catch (error: any) {
            console.error(error)
            notify.error("Error de Procesamiento", error?.response?.data?.message || "Error al asentar factura.")
        } finally {
            setIsProcesando(false)
        }
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Facturas de Proveedores", href: "/compras/facturas" },
                    { label: "Registrar Factura" },
                ]}
            />

            <main className="container mx-auto p-2 max-w-5xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold tracking-tight">Registrar Factura de Proveedor</h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/facturas")} className="h-8 gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" /> Volver
                    </Button>
                </div>

                <Card className="mb-3">
                    <CardHeader className="py-2.5">
                        <CardTitle className="text-sm font-semibold">1. Vincular Orden de Compra Pendiente</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FieldWrapper label="Orden de Compra Pendiente" id="ocSelect">
                            <select
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                                value={idOrdenSeleccionada}
                                onChange={(e) => handleSeleccionarOrden(e.target.value)}
                                disabled={isProcesando}
                            >
                                <option value="">Seleccione una orden de compra activa...</option>
                                {ordenesPendientes.map((o) => (
                                    <option key={o.idOrdenCompra} value={String(o.idOrdenCompra)}>
                                        OC #{o.idOrdenCompra} — {o.proveedor?.razonSocial || `ID: ${o.idProveedor}`}
                                    </option>
                                ))}
                            </select>
                        </FieldWrapper>

                        {proveedorInfo && (
                            <div className="bg-muted/40 rounded-md p-2 flex items-center gap-2 border border-dashed text-xs">
                                <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                                <div>
                                    <p className="font-semibold text-muted-foreground">Proveedor Detectado</p>
                                    <p className="font-bold text-foreground">{proveedorInfo.razonSocial}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {idOrdenSeleccionada && (
                    <>
                        <Card className="mb-3">
                            <CardHeader className="py-2.5">
                                <CardTitle className="text-sm font-semibold">2. Datos de Control e Impositivos</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <FieldWrapper label="Número de Factura" id="txtFactura">
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="001-001-0012345"
                                            value={nroComprobante}
                                            onChange={(e) => setNroComprobante(e.target.value)}
                                            disabled={isProcesando}
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="Número de Timbrado" id="txtTimbrado">
                                        <Input
                                            className="h-8 text-xs"
                                            placeholder="Ej. 16543210"
                                            value={timbrado}
                                            onChange={(e) => setTimbrado(e.target.value)}
                                            disabled={isProcesando}
                                        />
                                    </FieldWrapper>

                                    <FieldWrapper label="Fecha de Emisión" id="txtFecha">
                                        <Input
                                            type="date"
                                            className="h-8 text-xs"
                                            value={fechaFactura}
                                            onChange={(e) => setFechaFactura(e.target.value)}
                                            disabled={isProcesando}
                                        />
                                    </FieldWrapper>
                                </div>

                                <FieldWrapper label="Notas / Descripción de la Factura" id="txtDesc">
                                    <Input
                                        className="h-8 text-xs"
                                        placeholder="Observaciones internas..."
                                        value={descripcionCabecera}
                                        onChange={(e) => setDescripcionCabecera(e.target.value)}
                                        disabled={isProcesando}
                                    />
                                </FieldWrapper>
                            </CardContent>
                        </Card>

                        <Card className="mb-3">
                            <CardHeader className="py-2.5 bg-muted/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-semibold">3. Productos Recibidos e Ingreso a Stock</CardTitle>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase block">Total Factura</span>
                                    <span className="text-sm font-black text-primary">
                                        {calcularTotalFactura().toLocaleString("es-PY")} Gs.
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoadingData ? (
                                    <div className="flex flex-col items-center justify-center py-6 space-y-1">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <p className="text-[11px] text-muted-foreground">Cruzando historial...</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="text-xs">
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="text-center w-24">Solicitado</TableHead>
                                                <TableHead className="text-center w-24">Ya Facturado</TableHead>
                                                <TableHead className="text-center w-24 text-primary font-bold">Saldo</TableHead>
                                                <TableHead className="text-center w-28">Recibido</TableHead>
                                                <TableHead className="text-right">Precio Neto</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {itemsFactura.map((item) => (
                                                <TableRow key={item.idProducto} className="text-xs">
                                                    <TableCell className="font-medium max-w-[200px] truncate">
                                                        {item.descripcion}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {item.cantidadSolicitada}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {item.cantidadYaFacturada}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-primary bg-primary/5">
                                                        {item.cantidadPendiente}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            className={`h-7 text-center text-xs p-1 ${item.cantidadPendiente === 0 ? 'bg-muted' : ''}`}
                                                            value={item.cantidadRecibidaAhora}
                                                            min={0}
                                                            max={item.cantidadPendiente}
                                                            disabled={item.cantidadPendiente === 0 || isProcesando}
                                                            onChange={(e) => handleCantidadFacturadaChange(item.idProducto, Number(e.target.value))}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {(item.precioUnitario - item.descuento).toLocaleString("es-PY")} Gs.
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {item.totalItem.toLocaleString("es-PY")} Gs.
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                size="sm"
                                onClick={handleGuardarFactura}
                                disabled={isProcesando || isLoadingData}
                                className="gap-1.5"
                            >
                                {isProcesando ? (
                                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando...</>
                                ) : (
                                    <><Save className="h-3.5 w-3.5" /> Asentar Factura</>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}