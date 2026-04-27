"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { useRouter, useParams } from "next/navigation"
import { PedidoForm, Pedido } from "@/components/compras/pedido-form"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { pedidosAPI } from "@/services/pedidosAPI"

export default function EditarPedidoPage() {
  const router = useRouter()
  const params = useParams()

  const [pedido, setPedido] = useState<Pedido | null>(null)

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        const id = Number(params.id)
        const data = await pedidosAPI.getById(id)

        setPedido({
          id: data.idPedidoCompra.toString(),
          nroPedido: data.numeroPedido.toString(),
          fecha: data.fecha.substring(0, 10),
          estado: data.estado,
          items: [],
        })
      } catch (error) {
        console.error("Error al cargar pedido:", error)
      }
    }

    cargarPedido()
  }, [params.id])

  const handleSubmit = async (data: Pedido) => {
    try {
      const id = Number(params.id)

      await pedidosAPI.update(id, {
        idEstado: 1,
        numeroPedido: Number(data.nroPedido),
        fecha: data.fecha,
      })

      router.push("/compras/pedidos")
    } catch (error) {
      console.error("Error al actualizar pedido:", error)
    }
  }

  if (!pedido) {
    return <div className="p-6">Cargando pedido...</div>
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageBreadcrumb
          steps={[
            { label: "Compras" },
            { label: "Pedidos", href: "/compras/pedidos" },
            { label: "Editar Pedido" },
          ]}
        />

        <h2 className="text-2xl font-bold tracking-tight">Editar Pedido</h2>

        <PedidoForm
          pedidoEditado={pedido}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/compras/pedidos")}
        />
      </div>
    </div>
  )
}