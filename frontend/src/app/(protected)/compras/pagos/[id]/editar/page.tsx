"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Save, ArrowLeft, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { ordenesPagosAPI } from "@/services/ordenesPagosCompraAPI"
import { proveedoresAPI } from "@/services/proveedoresAPI"
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI"

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
    const params = useParams()
    const searchParams = useSearchParams()

    // 1. Extraemos el ID desde los parámetros de la ruta (/pagos/[id]/editar)
    const idOrden = params?.id

    // 2. Evaluamos los modos inspeccionando la URL real
    const isViewMode = searchParams.get("view") === "true" // Si tiene ?view=true
    const isEditMode = !!idOrden && !isViewMode            // Si tiene ID pero NO ?view=true

    // El formulario base siempre es de solo lectura si existe un idOrden (Ver y Editar)
    const isReadOnly = !!idOrden

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
    const [idEstado, setIdEstado] = useState<number>(1)

    const [mediosPago, setMediosPago] = useState<MedioPagoLinea[]>([
        { idMedioPagoCompra: 1, idCuentaBancaria: 0, referencia: "", monto: 0 }
    ])

    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isProcesando, setIsProcesando] = useState(false)

    useEffect(() => {
        const inicializarDatos = async () => {
            setIsLoadingData(true)
            try {
                const [resProv, resFact, resOP, resCuentas] = await Promise.all([
                    proveedoresAPI.getAll(1, 1000),
                    FacturasCompraAPI.getAll(1, 1000),
                    ordenesPagosAPI.getAll(1, 1000),
                    cuentasBancariasAPI.getAll(1, 1000)
                ])

                const provs = resProv.items || resProv || []
                const facturas = resFact.items || resFact || []
                const ordenes = resOP.items || resOP || []
                const cuentas = resCuentas.items || resCuentas || []

                setCuentasBancarias(cuentas)
                setProveedores(provs)

                const cuentaCaja = cuentas.find((c: CuentaBancaria) =>
                    c.tipoCuentaBancaria?.toLowerCase().includes("caja") ||
                    c.banco?.toLowerCase().includes("caja") ||
                    c.banco?.toLowerCase().includes("efectivo")
                )

                if (cuentaCaja) {
                    setIdCuentaCaja(cuentaCaja.idCuentaBancaria)
                }

                if (isReadOnly) {
                    // Modo VER o EDITAR: Traer la orden guardada usando el ID de la ruta
                    const opExistente = await ordenesPagosAPI.getById(Number(idOrden))
                    if (opExistente) {
                        setIdProveedor(String(opExistente.idProveedor))
                        setFechaPago(opExistente.fecha ? opExistente.fecha.substring(0, 10) : "")
                        setDescripcion(opExistente.descripcion || "")
                        setIdEstado(opExistente.idEstado || 1)

                        const detalles = opExistente.detalles || []
                        const idsFacturasInvolucradas = detalles.map((d: any) => d.idFacturaCompra)

                        const facturasAsociadas = facturas.filter((f: FacturaCompra) =>
                            idsFacturasInvolucradas.includes(f.idFacturaCompra)
                        )
                        setFacturasPendientes(facturasAsociadas)
                        setFacturasSeleccionadas(idsFacturasInvolucradas)

                        const mediosMapeados = detalles.map((d: any) => ({
                            idMedioPagoCompra: d.idMedioPagoCompra || 1,
                            idCuentaBancaria: d.idCuentaBancaria || 0,
                            referencia: d.referencia || d.medioPago || "REGISTRO OP",
                            monto: d.monto || 0
                        }))
                        setMediosPago(mediosMapeados)
                    }
                } else {
                    // Modo CREAR (Ruta /pagar): Filtrar deudas pendientes limpia
                    if (cuentaCaja) {
                        setMediosPago([{ idMedioPagoCompra: 1, idCuentaBancaria: cuentaCaja.idCuentaBancaria, referencia: "", monto: 0 }])
                    }

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
                }

            } catch (err) {
                console.error(err)
                notify.error("Error", "No se pudieron procesar los datos de la Orden de Pago.")
            } finally {
                setIsLoadingData(false)
            }
        }
        inicializarDatos()
    }, [idOrden, isReadOnly])

    useEffect(() => {
        if (isReadOnly || !idProveedor) {
            if (!idProveedor) {
                setFacturasPendientes([])
                setFacturasSeleccionadas([])
            }
            return
        }
        const filtradas = facturasGlobales.filter(f => String(f.idProveedor) === String(idProveedor))
        setFacturasPendientes(filtradas)
        setFacturasSeleccionadas([])
    }, [idProveedor, facturasGlobales, isReadOnly])

    const toggleFactura = (id: number) => {
        if (isReadOnly) return
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
        setIsProcesando(true)
        try {
            // Validaciones estructurales base (Solo aplican rigurosamente en Creación)
            if (!isEditMode) {
                if (!idProveedor) return notify.error("Campos vacíos", "Debe seleccionar un proveedor.")
                if (facturasSeleccionadas.length === 0) return notify.error("Sin documentos", "Debe marcar al menos una factura.")

                const tieneCuentasVacias = mediosPago.some(mp => mp.idCuentaBancaria === 0);
                if (tieneCuentasVacias) return notify.error("Datos incompletos", "Seleccione la Cuenta Bancaria de origen.");

                if (totalMediosPago !== totalFacturasSeleccionadas) {
                    return notify.error("Descalce de montos", "El total de medios de pago debe coincidir con el total de facturas.")
                }

                for (const mp of mediosPago) {
                    const cuenta = cuentasBancarias.find(c => c.idCuentaBancaria === mp.idCuentaBancaria);
                    if (cuenta && mp.monto > (cuenta.saldo ?? 0)) {
                        const nombre = mp.idMedioPagoCompra === 1 ? "Caja Interna" : `${cuenta.banco} (${cuenta.numeroCuenta})`;
                        return notify.error("Saldo Insuficiente", `La ${nombre} no cuenta con fondos suficientes.`);
                    }
                }
            }

            // Algoritmo de reconstrucción/distribución de líneas (Aplica para ambos modos)
            const facturasAFacturar = facturasPendientes
                .filter(f => facturasSeleccionadas.includes(f.idFacturaCompra))
                .map(f => ({ id: f.idFacturaCompra, saldoPendiente: calcularTotalFactura(f) }));

            const pagosADistribuir = mediosPago.map(mp => ({
                idMedio: mp.idMedioPagoCompra,
                idCuenta: mp.idCuentaBancaria,
                saldoDisponible: Number(mp.monto || 0)
            }));

            const detallesPayload: OrdenPagoCompraDetalleSaveDTO[] = [];
            let fIdx = 0, pIdx = 0;

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
                    idCuentaBancaria: pago.idCuenta
                });

                factura.saldoPendiente -= montoAAplicar;
                pago.saldoDisponible -= montoAAplicar;
            }

            // Construcción del DTO Completo
            const payloadPrincipal: OrdenPagoCompraSaveDTO = {
                idProveedor: Number(idProveedor),
                idEstado: idEstado, // Mantiene el estado seleccionado de la UI (Útil para creación (=1) o edición)
                fecha: new Date(fechaPago).toISOString().split('T')[0],
                descripcion: descripcion.trim() || `Pago liquidación facturas del proveedor.`,
                detalles: detallesPayload
            }

            if (isEditMode) {
                // 🚀 ENVIAR EL DTO COMPLETO EN EL PUT
                await ordenesPagosAPI.update(Number(idOrden), payloadPrincipal)
                notify.success("Éxito", "Estado de la Orden de Pago actualizado correctamente.")
            } else {
                // CREAR ORDEN NUEVA
                await ordenesPagosAPI.create(payloadPrincipal)
                notify.success("Éxito", "Orden de Pago emitida correctamente.")
            }

            router.push("/compras/pagos")
        } catch (err: any) {
            console.error(err)
            notify.error("Error de Procesamiento", err?.response?.data?.message || "Error al procesar la operación.")
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
                    { label: isEditMode ? "Editar Estado" : isViewMode ? "Ver Detalle" : "Emitir Pago" },
                ]}
            />

            <main className="container">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold tracking-tight">
                        {isEditMode ? "Modificar Estado de Orden" : isViewMode ? "Detalle de Orden de Pago" : "Cargar Orden de Pago"}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/pagos")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver
                    </Button>
                </div>

                {/* Cabecera de Datos */}
                <div className={cn(
                    "grid grid-cols-1 gap-4 mb-6 border p-4 rounded-lg bg-card relative",
                    isReadOnly ? "md:grid-cols-4" : "md:grid-cols-3"
                )}>
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
                                    disabled={isProcesando || isReadOnly}
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
                                        <CommandEmpty>No se encontraron proveedores.</CommandEmpty>
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
                                                    <Check className={cn("mr-2 h-4 w-4", idProveedor === String(p.idProveedor) ? "opacity-100" : "opacity-0")} />
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
                            disabled={isProcesando || isReadOnly}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Concepto / Nota Interna" id="txtObs">
                        <Input
                            className="h-9 text-xs"
                            placeholder="Ej. Pago correspondiente al mes..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            disabled={isProcesando || isReadOnly}
                        />
                    </FieldWrapper>

                    {/* El selector de estado se habilita exclusivamente en Modo Edición */}
                    {isReadOnly && (
                        <FieldWrapper label="Estado de la Orden" id="selectEstado">
                            <select
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-sm focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                                value={idEstado}
                                onChange={(e) => setIdEstado(Number(e.target.value))}
                                disabled={isViewMode || isProcesando}
                            >
                                <option value={1}>Pendiente / Emitido</option>
                                <option value={2}>Aprobado / Pagado</option>
                                <option value={3}>Anulado</option>
                            </select>
                        </FieldWrapper>
                    )}
                </div>

                {idProveedor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                        {/* IZQUIERDA: Facturas Involucradas */}
                        <div className="border rounded-lg bg-card overflow-hidden">
                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    {isReadOnly ? "Documentos Liquidados" : "1. Facturas Pendientes"}
                                </span>
                                <span className="text-xs font-black text-primary">Total Cubierto: {totalFacturasSeleccionadas.toLocaleString("es-PY")} Gs.</span>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs">
                                        <TableHead className="w-12 text-center">{isReadOnly ? "Estado" : "Pagar"}</TableHead>
                                        <TableHead>Nro. Comprobante</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Monto Neto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {facturasPendientes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">
                                                No existen documentos vinculados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        facturasPendientes.map((f) => (
                                            <TableRow key={f.idFacturaCompra} className="text-xs">
                                                <TableCell className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary h-3.5 w-3.5"
                                                        checked={facturasSeleccionadas.includes(f.idFacturaCompra)}
                                                        onChange={() => toggleFactura(f.idFacturaCompra)}
                                                        disabled={isProcesando || isReadOnly}
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

                        {/* DERECHA: Medios de Pago Desglosados */}
                        <div className="border rounded-lg bg-card overflow-hidden">
                            <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wide">
                                    {isReadOnly ? "Medios de Pago Utilizados" : "2. Desglose de Medios de Pago"}
                                </span>
                                <span className="text-xs font-black text-emerald-600">Total Desembolsado: {totalMediosPago.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            <div className="p-3 space-y-3">
                                {mediosPago.map((mp, index) => (
                                    <div key={index} className="flex gap-2 items-center border-b pb-3 last:border-none last:pb-0">

                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs w-1/4 disabled:opacity-75"
                                            value={mp.idMedioPagoCompra}
                                            onChange={(e) => handleMedioChange(index, "idMedioPagoCompra", Number(e.target.value))}
                                            disabled={isProcesando || isReadOnly}
                                        >
                                            <option value={1}>Efectivo</option>
                                            <option value={2}>Transferencia</option>
                                            <option value={3}>Cheque</option>
                                            <option value={4}>Nota Crédito</option>
                                        </select>

                                        {mp.idMedioPagoCompra === 1 ? (
                                            <div className="h-8 flex items-center px-3 bg-muted text-muted-foreground rounded-md text-[11px] w-1/3 border font-medium">
                                                Caja
                                            </div>
                                        ) : (
                                            <select
                                                className="h-8 rounded-md border border-input bg-background px-2 text-xs w-1/3 disabled:opacity-75"
                                                value={mp.idCuentaBancaria}
                                                onChange={(e) => handleMedioChange(index, "idCuentaBancaria", Number(e.target.value))}
                                                disabled={isProcesando || isReadOnly}
                                            >
                                                <option value={0}>Seleccionar Cuenta...</option>
                                                {cuentasBancarias
                                                    .filter(c => c.idCuentaBancaria !== idCuentaCaja || isReadOnly)
                                                    .map(c => (
                                                        <option key={c.idCuentaBancaria} value={c.idCuentaBancaria}>
                                                            {c.banco} — {c.numeroCuenta}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        )}

                                        <Input
                                            className="h-8 text-xs w-1/4 font-mono"
                                            placeholder="Ref / Nro Doc"
                                            value={mp.referencia}
                                            onChange={(e) => handleMedioChange(index, "referencia", e.target.value)}
                                            disabled={isProcesando || isReadOnly || mp.idMedioPagoCompra === 1}
                                        />

                                        <Input
                                            type="number"
                                            className="h-8 text-xs w-1/4 text-right font-bold"
                                            placeholder="Monto"
                                            value={mp.monto || ""}
                                            onChange={(e) => handleMedioChange(index, "monto", Number(e.target.value))}
                                            disabled={isProcesando || isReadOnly}
                                        />

                                        {mediosPago.length > 1 && !isReadOnly && (
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

                                {!isReadOnly && (
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
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Footer de Acciones Dinámico */}
                {idProveedor && (!isViewMode || isEditMode) && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            {isEditMode ? (
                                <span className="text-amber-600 font-medium">⚠️ Modo edición: Se actualizará el estado de la Orden.</span>
                            ) : totalFacturasSeleccionadas === totalMediosPago ? (
                                <span className="text-emerald-600 font-medium"> Balance correcto. Listo para asentar.</span>
                            ) : (
                                <span className="text-destructive font-medium"> Diferencia: {(totalFacturasSeleccionadas - totalMediosPago).toLocaleString("es-PY")} Gs.</span>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={handleGuardarOrdenPago}
                            disabled={isProcesando || isLoadingData || (!isEditMode && (totalFacturasSeleccionadas !== totalMediosPago || totalFacturasSeleccionadas === 0))}
                            className={cn("gap-1.5", isEditMode && "bg-amber-600 hover:bg-amber-700 text-white")}
                        >
                            {isProcesando ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando...</>
                            ) : isEditMode ? (
                                <><Save className="h-3.5 w-3.5" /> Actualizar Estado</>
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