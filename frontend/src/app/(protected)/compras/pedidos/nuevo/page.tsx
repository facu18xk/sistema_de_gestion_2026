// app/compras/pedidos/nuevo/page.tsx
"use client"

import Navbar from "@/components/navbar"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PedidoForm } from "@/components/compras/pedido-form"

import { pedidosAPI } from "@/services/pedidosAPI"
import { useRouter } from "next/navigation"
import { PedidoSaveDTO } from "@/types/types"

export default function NuevoPedidoPage() {
    const router = useRouter()

    return (
        <div>
            <Navbar />

            <div className="container mx-auto p-6 space-y-6">

                <PageBreadcrumb
                    steps={[
                        { label: "Compras", href: "/compras/pedidos" },
                        { label: "Pedidos", href: "/compras/pedidos" },
                        { label: "Nuevo Pedido" }
                    ]}
                />

                <PedidoForm
                    pedidoEditado={null}
                    onCancel={() => router.push("/compras/pedidos")}
                    onSubmit={async (data) => {

                        // 🔥 MAPEADOR CLARO (UI → BACKEND)
                        const payload: PedidoSaveDTO = {
                            nroCotizacion: data.nroCotizacion,
                            idProveedor: data.idProveedor,
                            fecha: data.fecha,
                            items: data.items,
                            total: data.items.reduce(
                                (acc, i) => acc + i.subtotal,
                                0
                            )
                        }

                        await pedidosAPI.create(payload)

                        router.push("/compras/pedidos")
                    }}
                />

            </div>
        </div>
    )
}