"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FileCheck, ArrowUpRight } from "lucide-react"
import { ordenesPagosAPI } from "@/services/ordenesPagosCompraAPI"
import { OrdenPagoCompra } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrdenesPagosPage() {
    const [ordenesPago, setOrdenesPago] = useState<OrdenPagoCompra[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrdenesPago = async () => {
            try {
                const response = await ordenesPagosAPI.getAll(1, 50)
                setOrdenesPago(response.items || response || [])
            } catch (error) {
                notify.error("Error", "No se pudo traer las órdenes de pago.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrdenesPago()
    }, [])

    // Sumariza de forma segura los montos de las facturas liquidadas en la orden
    const calcularTotalOrdenPago = (op: OrdenPagoCompra): number => {
        if (!op.detalles || !Array.isArray(op.detalles)) return 0
        return op.detalles.reduce((acc, det) => acc + (det.monto || 0), 0)
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Órdenes de Pago" }]} />

            <main className="container p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Órdenes de Pago a Proveedores</h2>
                    <Link href="/compras/pagos/cargar">
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Nueva Orden de Pago
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-24">Código</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Descripción / Concepto</TableHead>
                                    <TableHead className="w-28">Fecha</TableHead>
                                    <TableHead className="w-28 text-center">Estado</TableHead>
                                    <TableHead className="w-36 text-right">Total Pagado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordenesPago.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                                            No hay órdenes de pago registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ordenesPago.map((op) => (
                                        <TableRow key={op.idOrdenPagoCompra} className="hover:bg-muted/40 transition">
                                            <TableCell className="font-mono text-xs font-bold text-primary">
                                                #{op.idOrdenPagoCompra}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                {op.proveedor || `Proveedor #${op.idProveedor}`}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                                                {op.descripcion || "Sin descripción"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {op.fecha ? op.fecha.substring(0, 10) : "—"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                                    <FileCheck className="h-3 w-3" /> {op.estado || "Procesado"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-bold text-foreground">
                                                {calcularTotalOrdenPago(op).toLocaleString("es-PY")} Gs.
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
        </div>
    )
}