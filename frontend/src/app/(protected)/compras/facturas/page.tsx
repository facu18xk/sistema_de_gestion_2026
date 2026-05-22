"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FileText, ArrowUpRight } from "lucide-react"
import { FacturasCompraAPI } from "@/services/facturasCompraAPI"
import { FacturaCompra } from "@/types/types"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function FacturasPage() {
    const [facturas, setFacturas] = useState<FacturaCompra[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchFacturas = async () => {
            try {
                const response = await FacturasCompraAPI.getAll(1, 50)
                setFacturas(response.items || response || [])
            } catch (error) {
                notify.error("Error", "No se pudo traer las facturas de compra.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchFacturas()
    }, [])

    // Calcula el monto total acumulando el totalNeto de los detalles
    const calcularTotalFactura = (f: FacturaCompra): number => {
        if (!f.detalles || !Array.isArray(f.detalles)) return 0
        return f.detalles.reduce((acc, det) => acc + (det.totalNeto || 0), 0)
    }

    return (
        <div className="bg-background">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Facturas de Proveedores" }]} />

            <main className="container p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Facturas de Proveedores</h2>
                    <Link href="/compras/facturas/cargar">
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Registrar Factura
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
                                    <TableHead className="w-36">Nro. Comprobante</TableHead>
                                    <TableHead className="w-28">Timbrado</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead className="w-28">Fecha</TableHead>
                                    <TableHead className="w-32 text-center">Orden Origen</TableHead>
                                    <TableHead className="w-32 text-right">Total Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {facturas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                                            No hay facturas registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    facturas.map((f) => (
                                        <TableRow key={f.idFacturaCompra} className="hover:bg-muted/40 transition">
                                            <TableCell className="font-mono text-xs font-bold text-foreground">
                                                {f.nroComprobante}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {f.timbrado}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                                {f.proveedor || `Proveedor #${f.idProveedor}`}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {f.fecha ? f.fecha.substring(0, 10) : "—"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {f.idOrdenCompra ? (
                                                    <Link href={`/compras/ordenes/${f.idOrdenCompra}`}>
                                                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/10 hover:bg-primary/10 transition cursor-pointer">
                                                            OC #{f.idOrdenCompra}
                                                            <ArrowUpRight className="h-3 w-3 opacity-70" />
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[11px] text-muted-foreground italic">
                                                        Directa
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-right font-bold text-foreground">
                                                {calcularTotalFactura(f).toLocaleString("es-PY")} Gs.
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