"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FileCheck, Edit2, Lock } from "lucide-react"
import { ordenesCompraAPI } from "@/services/ordenesCompraAPI"
import { notify } from "@/lib/notifications"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrdenesPage() {
    const [ordenes, setOrdenes] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const response = await ordenesCompraAPI.getAll(1, 50)
                setOrdenes(response.items || response || [])
            } catch (error) {
                notify.error("Error", "No se pudo traer las órdenes de compra.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrdenes()
    }, [])

    return (
        <div className="bg-background">
            <PageBreadcrumb steps={[{ label: "Compras" }, { label: "Ordenes de Compra" }]} />

            <main className="container p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Ordenes de Compra</h2>
                    <Link href="/compras/ordenes/generar">
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Generar Orden
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
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="w-28">Fecha</TableHead>
                                    <TableHead className="w-28 text-center">Estado</TableHead>
                                    <TableHead className="w-24 text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordenes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                                            No hay órdenes registradas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ordenes.map((o) => {
                                        const esEditable = o.idEstado !== 3 && o.estado !== "Facturado"

                                        return (
                                            <TableRow key={o.idOrdenCompra} className="hover:bg-muted/40 transition">
                                                <TableCell className="font-mono text-xs font-bold text-primary">
                                                    #{o.idOrdenCompra}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium">
                                                    {o.proveedor || `Proveedor #${o.idProveedor}`}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                                                    {o.descripcion || "Sin descripción"}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {o.fecha ? o.fecha.substring(0, 10) : "—"}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${esEditable
                                                        ? "bg-blue-50 text-blue-700 ring-blue-600/10"
                                                        : "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                                                        }`}>
                                                        <FileCheck className="h-3 w-3" /> {o.estado || "Emitida"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {esEditable ? (
                                                        <Link href={`/compras/ordenes/${o.idOrdenCompra}/editar`}>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground cursor-not-allowed" disabled>
                                                            <Lock className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
        </div>
    )
}