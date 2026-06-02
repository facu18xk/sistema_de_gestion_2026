"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2, Save, CreditCard, Edit3, ChevronLeft, ChevronRight } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"

// --- INTERFACES ESTRICTAS DE TYPES ---
export interface ItemFacturaDetalle {
    idProducto: number
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

export interface FacturaCompra {
    id: number
    idProveedor: number
    proveedor: string
    idOrdenCompra?: number
    ordenCompraDescripcion?: string
    nroComprobante: string
    timbrado: string
    fecha: string
    estado: string
    detalles?: any[]
}

export default function VerEditarFacturaPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const id = params?.id ? String(params.id) : ""

    // Estados de datos fuertemente tipados
    const [factura, setFactura] = useState<FacturaCompra | null>(null)
    const [itemsFactura, setItemsFactura] = useState<ItemFacturaDetalle[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    // Estados locales para los campos editables de la Cabecera
    const [nroComprobante, setNroComprobante] = useState("")
    const [timbrado, setTimbrado] = useState("")
    const [fecha, setFecha] = useState("")

    // Estado de Paginación Local (8 productos por página)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const itemsPerPage = 8

    // Errores de Validación locales
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    // Normalización del estado para consistencia visual
    const estadoNormalizado = useMemo(() => {
        return factura?.estado ? factura.estado.toUpperCase() : "PENDIENTE"
    }, [factura?.estado])

    // --- TU PATRÓN DE CONTROL DE MODOS COHERENTE ---
    const esModoVerUrl = searchParams.get("view") === "true" || searchParams.has("view")
    const isViewMode = esModoVerUrl || (estadoNormalizado !== "PENDIENTE")

    useEffect(() => {
        if (!id) return

        const fetchDetalle = async () => {
            try {
                setIsLoading(true)

                // Doble casteo seguro para evadir conflictos de DTOs del backend
                const data = (await FacturasCompraAPI.getById(Number(id))) as unknown as FacturaCompra
                setFactura(data)

                // Inicializar estados de edición
                setNroComprobante(data.nroComprobante || "")
                setTimbrado(data.timbrado || "")
                if (data.fecha) {
                    setFecha(new Date(data.fecha).toISOString().split('T')[0])
                }

                if (data && data.detalles) {
                    const detallesMapeados = data.detalles.map((det: any) => ({
                        idProducto: det.idProducto,
                        descripcion: det.producto?.descripcion || det.descripcion || `Producto #${det.idProducto}`,
                        cantidad: det.cantidad || 0,
                        precioUnitario: det.precioUnitario || 0,
                        totalBruto: det.totalBruto || (det.cantidad * det.precioUnitario),
                        totalIva: det.totalIva || 0,
                        totalNeto: det.totalNeto || (det.totalBruto - (det.descuento || 0))
                    }))
                    setItemsFactura(detallesMapeados)
                }
            } catch (err) {
                console.error(err)
                notify.error("Error", "No se pudo obtener la información de la factura.")
                router.push("/compras/facturas")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDetalle()
    }, [id, router])

    // Validaciones de formato legal paraguayo
    const validarCampos = (): boolean => {
        const nuevosErrores: { [key: string]: string } = {}

        const regexComprobante = /^\d{3}-\d{3}-\d{7}$/
        if (!nroComprobante) {
            nuevosErrores.nroComprobante = "El número de comprobante es obligatorio"
        } else if (!regexComprobante.test(nroComprobante)) {
            nuevosErrores.nroComprobante = "Formato inválido. Debe ser (ej. 001-001-0000001)"
        }

        const regexTimbrado = /^\d{8}$/
        if (!timbrado) {
            nuevosErrores.timbrado = "El número de timbrado es obligatorio"
        } else if (!regexTimbrado.test(timbrado)) {
            nuevosErrores.timbrado = "Debe contener exactamente 8 números"
        }

        if (!fecha) {
            nuevosErrores.fecha = "La fecha de emisión es obligatoria"
        }

        setErrors(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const handleGuardarCambios = async () => {
        if (isViewMode || !validarCampos() || !factura) return

        try {
            setIsSaving(true)
            const payload = {
                ...factura,
                nroComprobante,
                timbrado,
                fecha: new Date(fecha).toISOString()
            }

            await FacturasCompraAPI.update(factura.id, payload)
            notify.success("Éxito", "Comprobante actualizado correctamente.")

            // Volver al modo vista usando tu query string standard
            router.push(`/compras/facturas/${id}?view=true`)
            setFactura(prev => prev ? { ...prev, nroComprobante, timbrado, fecha: new Date(fecha).toISOString() } : null)
        } catch (err) {
            console.error(err)
            notify.error("Error", "No se pudieron guardar las modificaciones.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleIrAPagar = () => {
        if (!factura) return
        router.push(`/compras/ordenes-pago/nuevo?idProveedor=${factura.idProveedor}&idFactura=${factura.id}`)
    }

    const totalFacturaNeto = useMemo(() => itemsFactura.reduce((acc, item) => acc + item.totalNeto, 0), [itemsFactura])
    const totalFacturaIva = useMemo(() => itemsFactura.reduce((acc, item) => acc + item.totalIva, 0), [itemsFactura])

    const totalPages = Math.ceil(itemsFactura.length / itemsPerPage)
    const paginatedItems = useMemo(() => {
        const offset = (currentPage - 1) * itemsPerPage
        return itemsFactura.slice(offset, offset + itemsPerPage)
    }, [itemsFactura, currentPage])

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
                    { label: isViewMode ? `Comprobante Asentado: ${factura?.nroComprobante || id}` : `Modificar Asiento: ${factura?.nroComprobante}` }
                ]}
            />

            <main className="w-full p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isViewMode ? `Comprobante Asentado: ${factura?.nroComprobante}` : "Modificar Comprobante de Compra"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            {isViewMode ? "Vista de sólo lectura del registro asentado." : "Edite los datos de cabecera autorizados por el sistema contable."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Botón Pagar Factura: Solo en vista y si NO está pagada ni anulada */}
                        {isViewMode && estadoNormalizado !== "PAGADO" && estadoNormalizado !== "ANULADO" && (
                            <Button variant="default" size="sm" onClick={handleIrAPagar} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                                <CreditCard className="h-4 w-4" /> Pagar Factura
                            </Button>
                        )}

                        {/* Botón Editar Inteligente: Solo si está en modo vista PERO sigue PENDIENTE en el backend */}
                        {isViewMode && estadoNormalizado === "PENDIENTE" && (
                            <Button variant="outline" size="sm" onClick={() => router.push(`/compras/facturas/${id}/editar`)} className="gap-1">
                                <Edit3 className="h-4 w-4" /> Editar Datos
                            </Button>
                        )}

                        {/* Guardar cambios (Solo modo edición activo) */}
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

                {/* Grid de Cabecera (6 campos limpios) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border p-4 rounded-lg bg-card w-full shadow-sm">
                    <div className="w-full">
                        <FieldWrapper label="Orden de Compra Origen" id="soOC">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.idOrdenCompra ? `OC #${factura.idOrdenCompra} — ${factura?.ordenCompraDescripcion || 'Ver Origen'}` : "OC sin especificar"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div className="w-full">
                        <FieldWrapper label="Proveedor" id="txtProv">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.proveedor || "No especificado"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div className="w-full">
                        <FieldWrapper label="Número de Comprobante" id="txtComp">
                            <Input
                                className={`h-9 text-xs w-full font-mono ${isViewMode ? 'bg-muted/50' : 'bg-background'}`}
                                value={nroComprobante}
                                onChange={(e) => setNroComprobante(e.target.value)}
                                placeholder="001-001-0000001"
                                disabled={isViewMode}
                            />
                            {errors.nroComprobante && (
                                <p className="text-destructive text-[11px] mt-1 font-medium">{errors.nroComprobante}</p>
                            )}
                        </FieldWrapper>
                    </div>

                    <div className="w-full">
                        <FieldWrapper label="Número de Timbrado" id="txtTimb">
                            <Input
                                className={`h-9 text-xs w-full font-mono ${isViewMode ? 'bg-muted/50' : 'bg-background'}`}
                                value={timbrado}
                                onChange={(e) => setTimbrado(e.target.value)}
                                maxLength={8}
                                placeholder="12345678"
                                disabled={isViewMode}
                            />
                            {errors.timbrado && (
                                <p className="text-destructive text-[11px] mt-1 font-medium">{errors.timbrado}</p>
                            )}
                        </FieldWrapper>
                    </div>

                    <div className="w-full">
                        <FieldWrapper label="Fecha de Emisión" id="txtFech">
                            <Input
                                type="date"
                                className={`h-9 text-xs w-full ${isViewMode ? 'bg-muted/50' : 'bg-background'}`}
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                disabled={isViewMode}
                            />
                            {errors.fecha && (
                                <p className="text-destructive text-[11px] mt-1 font-medium">{errors.fecha}</p>
                            )}
                        </FieldWrapper>
                    </div>

                    <div className="w-full">
                        <FieldWrapper label="Estado de Factura" id="txtEstado">
                            <span className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-xs font-bold w-full border ${estadoNormalizado === 'PAGADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                estadoNormalizado === 'ANULADO' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                {estadoNormalizado}
                            </span>
                        </FieldWrapper>
                    </div>
                </div>

                {/* Tabla de Items */}
                {itemsFactura.length > 0 ? (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full flex flex-col">
                        <Table className="w-full">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Producto / Descripción</TableHead>
                                    <TableHead className="w-28 text-center">Cant. Recibida</TableHead>
                                    <TableHead className="w-32 text-right">Precio Unit.</TableHead>
                                    <TableHead className="w-32 text-right">Total Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedItems.map((item) => (
                                    <TableRow key={item.idProducto} className="hover:bg-muted/10">
                                        <TableCell className="text-xs font-medium">
                                            {item.descripcion}
                                        </TableCell>
                                        <TableCell className="text-xs text-center text-muted-foreground font-mono">
                                            {item.cantidad}
                                        </TableCell>
                                        <TableCell className="text-xs text-right font-mono">
                                            {item.precioUnitario.toLocaleString("es-PY")} Gs.
                                        </TableCell>
                                        <TableCell className="text-xs text-right font-bold font-mono text-foreground">
                                            {item.totalNeto.toLocaleString("es-PY")} Gs.
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-2 bg-card">
                                <span className="text-xs text-muted-foreground">
                                    Mostrando página <b>{currentPage}</b> de <b>{totalPages}</b> ({itemsFactura.length} productos)
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-muted/30 flex flex-col items-end border-t gap-1.5 text-xs w-full">
                            <div className="text-muted-foreground">
                                Liquidación IVA (10% inc.): <span className="font-mono font-medium text-foreground">{totalFacturaIva.toLocaleString("es-PY")} Gs.</span>
                            </div>
                            <div className="text-sm font-bold text-primary">
                                Total General Factura: <span className="font-mono text-lg">{totalFacturaNeto.toLocaleString("es-PY")} Gs.</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 border rounded-lg text-muted-foreground text-sm bg-card">
                        Esta factura no cuenta con ítems detallados en el sistema.
                    </div>
                )}
            </main>
        </div>
    )
}