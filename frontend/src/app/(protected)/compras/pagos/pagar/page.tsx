"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { ordenesPagosAPI } from "@/services/ordenesPagosCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { FacturaCompra, MedioPagoLinea, OrdenPagoCompraSaveDTO, OrdenPagoCompraDetalleSaveDTO } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"

export default function CargarOrdenPagoPage() {
    const router = useRouter()
    const [proveedores, setProveedores] = useState<any[]>([])
    const [idProveedor, setIdProveedor] = useState<string>("")
    const [facturasPendientes, setFacturasPendientes] = useState<FacturaCompra[]>([])
    const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<number[]>([]) // IDs seleccionados

    const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0])
    const [descripcion, setDescripcion] = useState<string>("")

    // Estado para la gestión dinámica de Medios de Pago
    const [mediosPago, setMediosPago] = useState<MedioPagoLinea[]>([
        { tipo: "Efectivo", referencia: "Efectivo en Caja", monto: 0 }
    ])

    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isProcesando, setIsProcesando] = useState(false)

    // Cargar proveedores al arrancar
    useEffect(() => {
        const cargarProveedores = async () => {
            try {
                const res = await proveedoresAPI.getAll(1, 500)
                setProveedores(res.items || res || [])
            } catch (err) {
                notify.error("Error", "No se pudo cargar la lista de proveedores.")
            }
        }
        cargarProveedores()
    }, [])

    // Monitorear selección de proveedor para buscar únicamente sus facturas
    useEffect(() => {
        const cargarFacturasDeProveedor = async () => {
            if (!idProveedor) {
                setFacturasPendientes([])
                setFacturasSeleccionadas([])
                return
            }
            setIsLoadingData(true)
            try {
                const resFacturas = await FacturasCompraAPI.getAll(1, 1000)
                const todas = resFacturas.items || resFacturas || []

                // Filtrar facturas asociadas a este proveedor específico (simulado: idealmente vendría por filtro de backend)
                const filtradas = todas.filter((f: FacturaCompra) => String(f.idProveedor) === String(idProveedor))
                setFacturasPendientes(filtradas)
                setFacturasSeleccionadas([])
            } catch (err) {
                notify.error("Error", "Error al recuperar las cuentas a pagar del proveedor.")
            } finally {
                setIsLoadingData(false)
            }
        }
        cargarFacturasDeProveedor()
    }, [idProveedor])

    const toggleFactura = (id: number) => {
        setFacturasSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
        )
    }

    const calcularTotalFactura = (f: FacturaCompra): number => {
        if (!f.detalles) return 0
        return f.detalles.reduce((acc, det) => acc + (det.totalNeto || 0), 0)
    }

    const totalFacturasSeleccionadas = facturasPendientes
        .filter(f => facturasSeleccionadas.includes(f.idFacturaCompra))
        .reduce((acc, f) => acc + calcularTotalFactura(f), 0)

    const totalMediosPago = mediosPago.reduce((acc, mp) => acc + Number(mp.monto || 0), 0)

    // Métodos para la grilla de Medios de Pago
    const agregarMedioPago = () => {
        setMediosPago([...mediosPago, { tipo: "Efectivo", referencia: "", monto: 0 }])
    }

    const eliminarMedioPago = (index: number) => {
        setMediosPago(mediosPago.filter((_, i) => i !== index))
    }

    const handleMedioChange = (index: number, campo: keyof MedioPagoLinea, valor: any) => {
        setMediosPago(prev => prev.map((mp, i) => i === index ? { ...mp, [campo]: valor } : mp))
    }

    const handleGuardarOrdenPago = async () => {
        if (!idProveedor) return notify.error("Campos vacíos", "Debe seleccionar un proveedor.")
        if (facturasSeleccionadas.length === 0) return notify.error("Sin documentos", "Debe marcar al menos una factura para procesar la orden.")
        if (totalMediosPago !== totalFacturasSeleccionadas) {
            return notify.error("Descalce de montos", `El total de medios de pago (${totalMediosPago.toLocaleString("es-PY")} Gs.) debe ser idéntico al total de las facturas seleccionadas (${totalFacturasSeleccionadas.toLocaleString("es-PY")} Gs.).`)
        }

        setIsProcesando(true)
        try {
            // 1. Asentar Cabecera
            const cabeceraPayload: OrdenPagoCompraSaveDTO = {
                idProveedor: Number(idProveedor),
                idEstado: 1,
                fecha: new Date(fechaPago).toISOString(),
                descripcion: descripcion.trim() || `Pago liquidación facturas del proveedor.`
            }

            const nuevaOP = await ordenesPagosAPI.create(cabeceraPayload)
            const idOPGenerada = nuevaOP?.idOrdenPagoCompra || nuevaOP?.id

            if (!idOPGenerada) throw new Error("No se pudo obtener el ID de la orden de pago generada.")

            // 2. Asentar Detalles por cada factura seleccionada
            const promesasDetalles = facturasPendientes
                .filter(f => facturasSeleccionadas.includes(f.idFacturaCompra))
                .map(f => {
                    const detallePayload: OrdenPagoCompraDetalleSaveDTO = {
                        idOrdenPagoCompra: idOPGenerada,
                        idFacturaCompra: f.idFacturaCompra,
                        monto: calcularTotalFactura(f)
                    }
                    return ordenesPagosAPI.createDetalle(detallePayload)
                })

            await Promise.all(promesasDetalles)

            notify.success("Éxito", "Orden de Pago emitida y facturas canceladas correctamente.")
            router.push("/compras/pagos")
        } catch (err: any) {
            console.error(err)
            notify.error("Error de Procesamiento", err?.response?.data?.message || "Error al procesar la liquidación.")
        } finally {
            setIsProcesando(false)
        }
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Órdenes de Pago", href: "/compras/pagos" },
                    { label: "Emitir Pago" },
                ]}
            />

            <main className="container p-4 max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Cargar Orden de Pago</h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/pagos")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>

                {/* Cabecera y Selección del Proveedor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border p-4 rounded-lg bg-card">
                    <FieldWrapper label="Proveedor a Liquidar" id="selectProv">
                        <select
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary"
                            value={idProveedor}
                            onChange={(e) => setIdProveedor(e.target.value)}
                            disabled={isProcesando}
                        >
                            <option value="">Seleccione el proveedor...</option>
                            {proveedores.map((p) => (
                                <option key={p.idProveedor} value={String(p.idProveedor)}>
                                    {p.razonSocial || p.nombre} — RUC: {p.ruc}
                                </option>
                            ))}
                        </select>
                    </FieldWrapper>

                    <FieldWrapper label="Fecha de Operación" id="txtFecha">
                        <Input
                            type="date"
                            className="h-9 text-xs"
                            value={fechaPago}
                            onChange={(e) => setFechaPago(e.target.value)}
                            disabled={isProcesando}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Concepto / Nota Interna" id="txtObs">
                        <Input
                            className="h-9 text-xs"
                            placeholder="Ej. Pago correspondiente al mes..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            disabled={isProcesando}
                        />
                    </FieldWrapper>
                </div>

                {idProveedor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                        {/* IZQUIERDA: Cuentas por Pagar (Facturas) */}
                        <div className="border rounded-lg bg-card overflow-hidden">
                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wide">1. Facturas Pendientes</span>
                                <span className="text-xs font-black text-primary">Deuda Seleccionada: {totalFacturasSeleccionadas.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            {isLoadingData ? (
                                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="text-xs">
                                            <TableHead className="w-12 text-center">Pagar</TableHead>
                                            <TableHead>Nro. Comprobante</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead className="text-right">Monto Neto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {facturasPendientes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">No existen facturas con saldo para este proveedor.</TableCell>
                                            </TableRow>
                                        ) : (
                                            facturasPendientes.map((f) => (
                                                <TableRow key={f.idFacturaCompra} className="text-xs">
                                                    <TableCell className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                                                            checked={facturasSeleccionadas.includes(f.idFacturaCompra)}
                                                            onChange={() => toggleFactura(f.idFacturaCompra)}
                                                            disabled={isProcesando}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold">{f.nroComprobante}</TableCell>
                                                    <TableCell>{f.fecha ? f.fecha.substring(0, 10) : "—"}</TableCell>
                                                    <TableCell className="text-right font-medium">{calcularTotalFactura(f).toLocaleString("es-PY")} Gs.</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {/* DERECHA: Gestión Multimedio de Pagos */}
                        <div className="border rounded-lg bg-card overflow-hidden">
                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wide">2. Desglose de Medios de Pago</span>
                                <span className="text-xs font-black text-emerald-600">Total Cargado: {totalMediosPago.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            <div className="p-3 space-y-3">
                                {mediosPago.map((mp, index) => (
                                    <div key={index} className="flex gap-2 items-center border-b pb-3 last:border-none last:pb-0">
                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary w-1/3"
                                            value={mp.tipo}
                                            onChange={(e) => handleMedioChange(index, "tipo", e.target.value)}
                                            disabled={isProcesando}
                                        >
                                            <option value="Efectivo">Efectivo</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Transferencia">Transferencia</option>
                                            <option value="Nota de Crédito">Nota de Crédito</option>
                                        </select>

                                        <Input
                                            className="h-8 text-xs w-1/3"
                                            placeholder="Ref / Nro Doc"
                                            value={mp.referencia}
                                            onChange={(e) => handleMedioChange(index, "referencia", e.target.value)}
                                            disabled={isProcesando}
                                        />

                                        <Input
                                            type="number"
                                            className="h-8 text-xs w-1/3 text-right"
                                            placeholder="Monto"
                                            value={mp.monto || ""}
                                            onChange={(e) => handleMedioChange(index, "monto", Number(e.target.value))}
                                            disabled={isProcesando}
                                        />

                                        {mediosPago.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={() => eliminarMedioPago(index)}
                                                disabled={isProcesando}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs h-8 gap-1 border-dashed mt-2"
                                    onClick={agregarMedioPago}
                                    disabled={isProcesando}
                                >
                                    <Plus className="h-3.5 w-3.5" /> Añadir otro medio de pago
                                </Button>
                            </div>
                        </div>

                    </div>
                )}

                {/* Botón de Guardado e Impacto Final */}
                {idProveedor && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            {totalFacturasSeleccionadas === totalMediosPago ? (
                                <span className="text-emerald-600 font-medium"> Balance correcto. Listo para asentar.</span>
                            ) : (
                                <span className="text-destructive font-medium"> Diferencia: {(totalFacturasSeleccionadas - totalMediosPago).toLocaleString("es-PY")} Gs.</span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={handleGuardarOrdenPago}
                            disabled={isProcesando || isLoadingData || totalFacturasSeleccionadas !== totalMediosPago}
                            className="gap-1.5"
                        >
                            {isProcesando ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando...</>
                            ) : (
                                <><Save className="h-3.5 w-3.5" /> Confirmar Orden de Pago</>
                            )}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}