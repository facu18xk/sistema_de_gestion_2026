"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader2 } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldWrapper } from "@/components/FieldWrapper"

interface ItemFacturaDetalle {
    idProducto: number
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

export default function VerFacturaPage() {
    const router = useRouter()
    const { id } = useParams()

    // Usamos any para evitar los bloqueos estrictos de interfaz DTO vs Entidad Completa
    const [factura, setFactura] = useState<any>(null)
    const [itemsFactura, setItemsFactura] = useState<ItemFacturaDetalle[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!id) return

        const fetchDetalle = async () => {
            try {
                // Casteamos la respuesta con "as any" o "as FacturaCompra" 
                // para que TypeScript sepa que SÍ vienen los detalles incluidos.
                const data = await FacturasCompraAPI.getById(Number(id)) as any
                setFactura(data)

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
    if (isLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Totales calculados a partir del array de ítems mapeados
    const totalFacturaNeto = itemsFactura.reduce((acc, item) => acc + item.totalNeto, 0)
    const totalFacturaIva = itemsFactura.reduce((acc, item) => acc + item.totalIva, 0)

    return (
        <div className="bg-background w-full">
            <PageBreadcrumb
                steps={[
                    { label: "Compras" },
                    { label: "Facturas", href: "/compras/facturas" },
                    { label: `Comprobante Asentado: ${factura?.nroComprobante || id}` }
                ]}
            />

            <main className="w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Comprobante Asentado: {factura?.nroComprobante}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/compras/facturas")} className="gap-1">
                        <ArrowLeft className="h-4 w-4" /> Volver al listado
                    </Button>
                </div>

                {/* Sección superior de datos de Cabecera - Vista idéntica, todo Disabled */}
                <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 items-end mb-6 border p-4 rounded-lg bg-card w-full">
                    <div className="flex-1 min-w-[280px]">
                        <FieldWrapper label="Orden de Compra Origen" id="soOC">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.idOrdenCompra ? `OC #${factura.idOrdenCompra} — ${factura?.ordenCompraDescripcion || 'Ver Origen'}` : "OC sin especificar"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <FieldWrapper label="Proveedor" id="txtProv">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.proveedor || "No especificado"}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <FieldWrapper label="Número de Timbrado" id="txtTimb">
                            <Input
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.timbrado || ""}
                                disabled
                            />
                        </FieldWrapper>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                        <FieldWrapper label="Fecha de Emisión" id="txtFech">
                            <Input
                                type="text"
                                className="h-9 text-xs w-full bg-muted/50"
                                value={factura?.fecha ? new Date(factura.fecha).toLocaleDateString("es-PY") : ""}
                                disabled
                            />
                        </FieldWrapper>
                    </div>
                </div>

                {/* Tabla de Items - Solo Lectura */}
                {itemsFactura.length > 0 ? (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full">
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
                                {itemsFactura.map((item) => (
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

                        {/* Bloque de Liquidación de Totales */}
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