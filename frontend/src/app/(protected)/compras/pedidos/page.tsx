// app/compras/pedidos/page.tsx
"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"

import { pedidosAPI } from "@/services/pedidosAPI"
import { PedidoDTO } from "@/types/types"

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<PedidoDTO[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const cargar = async () => {
        setIsLoading(true)
        const res = await pedidosAPI.getAll()
        setPedidos(res)
        setIsLoading(false)
    }

    useEffect(() => { cargar() }, [])

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-6 space-y-6">

                <PageBreadcrumb steps={[
                    { label: "Compras", href: "#" },
                    { label: "Pedidos" }
                ]} />

                <PageHeader
                    title="Gestión de Pedidos"
                    buttonLabel="Nuevo Pedido"
                    onButtonClick={() => router.push("/compras/pedidos/nuevo")}
                />

                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : (
                    <DataTable
                        caption="Órdenes de compra."
                        headerRow={
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        }
                    >
                        {pedidos.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.fecha}</TableCell>
                                <TableCell>{p.nombreProveedor}</TableCell>
                                <TableCell>${p.total}</TableCell>
                                <TableCell>{p.estado}</TableCell>
                                <TableCell>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => console.log("Editar pedido", p)} // 👈 FIX
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </DataTable>
                )}
            </div>
        </div>
    )
}