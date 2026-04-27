"use client"

import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"
import { PedidoForm, Pedido } from "@/components/compras/pedido-form"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"

export default function NuevoPedidoPage() {
  const router = useRouter()

  const handleSubmit = (data: Pedido) => {
    console.log("Pedido creado:", data)
    router.push("/compras/pedidos")
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb
          steps={[
            { label: "Compras" },
            { label: "Pedidos" },
            { label: "Nuevo Pedido" },
          ]}
        />

        <h2 className="text-2xl font-bold tracking-tight">Nuevo Pedido</h2>

        <PedidoForm
          pedidoEditado={null}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
        />
      </div>
    </div>
  )
}