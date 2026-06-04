"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { ordenesPagosAPI } from "@/services/ordenesPagosCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI"
import { cuentasContablesAPI } from "@/services/cuentasContablesAPI"
import { FacturaCompra, CuentaBancaria, OrdenPagoCompraSaveDTO, OrdenPagoCompraDetalleSaveDTO } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"
import { cn } from "@/lib/utils"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface MedioPagoLinea {
    idMedioPagoCompra: number;
    idCuentaBancaria: number;
    referencia: string;
    monto: number;
}

export default function CargarOrdenPagoPage() {
    const router = useRouter()

    const [proveedores, setProveedores] = useState<any[]>([])
    const [idProveedor, setIdProveedor] = useState<string>("")
    const [openProveedorModal, setOpenProveedorModal] = useState(false)

    const [facturasGlobales, setFacturasGlobales] = useState<FacturaCompra[]>([])
    const [facturasPendientes, setFacturasPendientes] = useState<FacturaCompra[]>([])
    const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<number[]>([])

    const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([])
    const [idCuentaCaja, setIdCuentaCaja] = useState<number | null>(null)

    const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split('T')[0])
    const [descripcion, setDescripcion] = useState<string>("")

    const [idCuentaContable, setIdCuentaContable] = useState<number | null>(null)
    const [idProcesoContable, setIdProcesoContable] = useState<number | null>(null)

    const [mediosPago, setMediosPago] = useState<MedioPagoLinea[]>([
        { idMedioPagoCompra: 1, idCuentaBancaria: 0, referencia: "", monto: 0 }
    ])

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isProcesando, setIsProcesando] = useState(false)

    useEffect(() => {
        const inicializarDatos = async () => {
            setIsLoadingData(true)
            try {
                // Agregamos la llamada a la API de cuentas contables
                const [resProv, resFact, resOP, resCuentas, resPlanContable] = await Promise.all([
                    proveedoresAPI.getAll(1, 1000),
                    FacturasCompraAPI.getAll(1, 1000),
                    ordenesPagosAPI.getAll(1, 1000),
                    cuentasBancariasAPI.getAll(1, 1000),
                    cuentasContablesAPI.getAll(1, 1000)
                ])

                const provs = resProv.items || resProv || []
                const facturas = resFact.items || resFact || []
                const ordenes = resOP.items || resOP || []
                const cuentas = resCuentas.items || resCuentas || []
                const planContable = resPlanContable.items || resPlanContable || []

                // 1. Lógica existente para buscar la cuenta Caja
                const cuentaCaja = cuentas.find((c: CuentaBancaria) =>
                    c.tipoCuentaBancaria?.toLowerCase().includes("caja") ||
                    c.banco?.toLowerCase().includes("caja") ||
                    c.banco?.toLowerCase().includes("efectivo")
                )

                if (cuentaCaja) {
                    setIdCuentaCaja(cuentaCaja.idCuentaBancaria)
                    setMediosPago([{ idMedioPagoCompra: 1, idCuentaBancaria: cuentaCaja.idCuentaBancaria, referencia: "", monto: 0 }])
                }

                // 2. ➔ NUEVA LÓGICA: Buscar la cuenta Costo de Mercaderías de forma dinámica
                const cuentaCosto = planContable.find((cuenta: any) =>
                    cuenta.numeroCuenta === "501" ||
                    cuenta.nombre.toLowerCase().includes("costo de mercaderias")
                )

                if (cuentaCosto) {
                    setIdCuentaContable(cuentaCosto.idCuentaContable)
                    setIdProcesoContable(cuentaCosto.idProcesoContable)
                } else {
                    console.warn("No se encontró la cuenta 'Costo de Mercaderías' (501) en el plan de cuentas.")
                    notify.error("Configuración Contable", "Falta definir la cuenta de Costo de Mercaderías en el sistema.")
                }

                // ... El resto de tu lógica de facturas pendientes y proveedores con deuda ...
                const facturasProcesadasIds = new Set<number>()
                ordenes.forEach((op: any) => {
                    if (op.detalles && Array.isArray(op.detalles)) {
                        op.detalles.forEach((det: any) => facturasProcesadasIds.add(det.idFacturaCompra))
                    }
                })

                const facturasLibres = facturas.filter((f: FacturaCompra) => !facturasProcesadasIds.has(f.idFacturaCompra))
                const proveedoresConDeudaIds = new Set(facturasLibres.map((f: FacturaCompra) => String(f.idProveedor)))
                const proveedoresConDeuda = provs.filter((p: any) => proveedoresConDeudaIds.has(String(p.idProveedor)))

                setFacturasGlobales(facturasLibres)
                setProveedores(proveedoresConDeuda)
                setCuentasBancarias(cuentas)

            } catch (err) {
                console.error(err)
                notify.error("Error", "No se pudieron cargar los datos iniciales.")
            } finally {
                setIsLoadingData(false)
            }
        }
        inicializarDatos()
    }, [])

    useEffect(() => {
        if (!idProveedor) {
            setFacturasPendientes([])
            setFacturasSeleccionadas([])
            return
        }
        const filtradas = facturasGlobales.filter(f => String(f.idProveedor) === String(idProveedor))
        setFacturasPendientes(filtradas)
        setFacturasSeleccionadas([])
    }, [idProveedor, facturasGlobales])

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

    const agregarMedioPago = () => {
        setMediosPago([...mediosPago, { idMedioPagoCompra: 1, idCuentaBancaria: idCuentaCaja || 0, referencia: "", monto: 0 }])
    }

    const eliminarMedioPago = (index: number) => {
        setMediosPago(mediosPago.filter((_, i) => i !== index))
    }

    const handleMedioChange = (index: number, campo: keyof MedioPagoLinea, valor: any) => {
        setMediosPago(prev => prev.map((mp, i) => {
            if (i !== index) return mp;

            const nuevaLinea = { ...mp, [campo]: valor };

            if (campo === "idMedioPagoCompra" && Number(valor) === 1) {
                nuevaLinea.idCuentaBancaria = idCuentaCaja || 0;
                nuevaLinea.referencia = "EFECTIVO O.P.";
            } else if (campo === "idMedioPagoCompra" && Number(valor) !== 1) {
                nuevaLinea.idCuentaBancaria = 0;
                nuevaLinea.referencia = "";
            }

            return nuevaLinea;
        }))
    }
    const handleGuardarOrdenPago = async () => {
        if (!idProveedor) return notify.error("Campos vacíos", "Debe seleccionar un proveedor.")
        if (facturasSeleccionadas.length === 0) return notify.error("Sin documentos", "Debe marcar al menos una factura para procesar la orden.")

        const tieneCuentasVacias = mediosPago.some(mp => mp.idCuentaBancaria === 0);
        if (tieneCuentasVacias) return notify.error("Datos incompletos", "Por favor seleccione la Cuenta Bancaria de origen para transferencias o cheques.");

        if (totalMediosPago !== totalFacturasSeleccionadas) {
            return notify.error("Descalce de montos", `El total de medios de pago (${totalMediosPago.toLocaleString("es-PY")} Gs.) debe coincidir con el total de las facturas seleccionadas (${totalFacturasSeleccionadas.toLocaleString("es-PY")} Gs.).`)
        }

        // ... (mantené tu bucle de validación de saldos disponibles aquí) ...

        setIsProcesando(true)
        try {
            const facturasAFacturar = facturasPendientes
                .filter(f => facturasSeleccionadas.includes(f.idFacturaCompra))
                .map(f => ({ id: f.idFacturaCompra, saldoPendiente: calcularTotalFactura(f) }));

            const pagosADistribuir = mediosPago.map(mp => ({
                idMedio: mp.idMedioPagoCompra,
                idCuenta: mp.idCuentaBancaria,
                saldoDisponible: Number(mp.monto || 0)
            }));

            const detallesPayload: any[] = []; // Usamos 'any' temporal para que TypeScript no chille si el DTO estricto no los tiene
            let fIdx = 0;
            let pIdx = 0;

            while (fIdx < facturasAFacturar.length && pIdx < pagosADistribuir.length) {
                const factura = facturasAFacturar[fIdx];
                const pago = pagosADistribuir[pIdx];

                if (factura.saldoPendiente === 0) { fIdx++; continue; }
                if (pago.saldoDisponible === 0) { pIdx++; continue; }
                const montoAAplicar = Math.min(factura.saldoPendiente, pago.saldoDisponible);

                detallesPayload.push({
                    idFacturaCompra: factura.id,
                    monto: montoAAplicar,
                    idMedioPagoCompra: pago.idMedio,
                    idCuentaBancaria: pago.idCuenta,

                    // ➔ INYECCIÓN EN EL DETALLE: Por si el backend genera el asiento iterando las líneas
                    idCuentaContable: idCuentaContable,
                    idProcesoContable: idProcesoContable
                });

                factura.saldoPendiente -= montoAAplicar;
                pago.saldoDisponible -= montoAAplicar;
            }

            const payloadPrincipal: any = {
                idProveedor: Number(idProveedor),
                idEstado: 1,
                fecha: new Date(fechaPago).toISOString().split('T')[0],
                descripcion: descripcion.trim() || `Pago liquidación facturas del proveedor.`,
                detalles: detallesPayload,

                // ➔ INYECCIÓN EN LA CABECERA: Para que la validación global del servicio encuentre el contexto contable
                idCuentaContable: idCuentaContable,
                idProcesoContable: idProcesoContable
            }

            console.log("Payload FINAL con datos contables inyectados:", payloadPrincipal)

            await ordenesPagosAPI.create(payloadPrincipal)

            notify.success("Éxito", "Orden de Pago emitida correctamente.")
            router.push("/compras/pagos")
        } catch (err: any) {
            console.error(err)
            notify.error("Error de Procesamiento", err?.response?.data?.message || "Error al procesar la liquidación. Verifique la conexión con el servidor.")
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

            <main className="container">
                <div className="flex items-center justify-between mb-6">
                    <h5 className="font-bold tracking-tight">Cargar Orden de Pago</h5>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/pagos")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>

                {/* Cabecera y Selección del Proveedor */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border p-4 rounded-lg bg-card relative">
                    {isLoadingData && (
                        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}

                    <FieldWrapper label="Proveedor a Liquidar" id="selectProv">
                        <Popover open={openProveedorModal} onOpenChange={setOpenProveedorModal}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProveedorModal}
                                    className="w-full justify-between font-normal"
                                    disabled={isProcesando}
                                >
                                    {idProveedor
                                        ? (() => {
                                            const prov = proveedores.find((p) => String(p.idProveedor) === idProveedor);
                                            return prov ? `${prov.razonSocial || prov.nombre} (RUC: ${prov.ruc})` : "Seleccione...";
                                        })()
                                        : "Seleccionar proveedor..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar por nombre o RUC..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron proveedores con deudas.</CommandEmpty>
                                        <CommandGroup>
                                            {proveedores.map((p) => (
                                                <CommandItem
                                                    key={p.idProveedor}
                                                    value={`${p.razonSocial || p.nombre} ${p.ruc}`}
                                                    onSelect={() => {
                                                        setIdProveedor(String(p.idProveedor))
                                                        setOpenProveedorModal(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            idProveedor === String(p.idProveedor) ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <span className="truncate">{p.razonSocial || p.nombre} — {p.ruc}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
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
                                            <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                                                No existen facturas pendientes para este proveedor.
                                            </TableCell>
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

                                        {/* Selector de Medio de Pago con IDs */}
                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary w-1/4"
                                            value={mp.idMedioPagoCompra}
                                            onChange={(e) => handleMedioChange(index, "idMedioPagoCompra", Number(e.target.value))}
                                            disabled={isProcesando}
                                        >
                                            <option value={1}>Efectivo</option>
                                            <option value={2}>Transferencia</option>
                                            <option value={3}>Cheque</option>
                                            <option value={4}>Nota Crédito</option>
                                        </select>

                                        {/* Selector dinámico de Banco (Se oculta si es Efectivo) */}
                                        {mp.idMedioPagoCompra === 1 ? (
                                            <div className="h-8 flex items-center px-3 bg-muted text-muted-foreground rounded-md text-[11px] w-1/3 border font-medium">
                                                Caja
                                            </div>
                                        ) : (
                                            <select
                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary w-1/3"
                                                value={mp.idCuentaBancaria}
                                                onChange={(e) => handleMedioChange(index, "idCuentaBancaria", Number(e.target.value))}
                                                disabled={isProcesando}
                                            >
                                                <option value={0}>Seleccionar Cuenta...</option>
                                                {cuentasBancarias
                                                    .filter(c => c.idCuentaBancaria !== idCuentaCaja)
                                                    .map(c => (
                                                        <option key={c.idCuentaBancaria} value={c.idCuentaBancaria}>
                                                            {c.banco} — {c.numeroCuenta}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        )}

                                        <Input
                                            className="h-8 text-xs w-1/4"
                                            placeholder="Ref / Nro Doc"
                                            value={mp.referencia}
                                            onChange={(e) => handleMedioChange(index, "referencia", e.target.value)}
                                            disabled={isProcesando || mp.idMedioPagoCompra === 1}
                                        />

                                        <Input
                                            type="number"
                                            className="h-8 text-xs w-1/4 text-right"
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
                            title="Guardar"
                            onClick={handleGuardarOrdenPago}
                            disabled={
                                isProcesando ||
                                isLoadingData ||
                                totalFacturasSeleccionadas !== totalMediosPago ||
                                totalFacturasSeleccionadas === 0 ||
                                !idCuentaContable ||
                                !idProcesoContable
                            }
                            className="gap-1.5"
                        >Guardar</Button>
                    </div>
                )}
            </main>
        </div>
    )
}