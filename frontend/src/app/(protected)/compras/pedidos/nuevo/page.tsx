// app/compras/pedidos/nuevo/page.tsx
"use client"

import Navbar from "@/components/navbar"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PedidoForm } from "@/components/compras/pedido-form"

import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI"
import { pedidosAPI } from "@/services/pedidosAPI"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Marca, Categoria, Pais } from "@/types/types"

export default function NuevoPedidoPage() {
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [paises, setPaises] = useState<Pais[]>([])
    const router = useRouter()

    useEffect(() => {
        const cargar = async () => {
            const [m, c, p] = await Promise.all([
                marcasAPI.getAll(),
                categoriasAPI.getAll(),
                ubicacionesAPI.getPaises()
            ])
            setMarcas(m)
            setCategorias(c)
            setPaises(p)
        }
        cargar()
    }, [])

    return (
        <div>
            <Navbar />
            <div className="container mx-auto p-6 space-y-6">

                <PageBreadcrumb steps={[
                    { label: "Compras", href: "/compras/pedidos" },
                    { label: "Pedidos", href: "/compras/pedidos" },
                    { label: "Nuevo Pedido" }
                ]} />

                <PedidoForm
                    pedidoEditado={null}
                    marcas={marcas}
                    categorias={categorias}
                    paises={paises}
                    onCancel={() => router.push("/compras/pedidos")}
                    onSuccess={async (data) => {
                        await pedidosAPI.create(data)
                        router.push("/compras/pedidos")
                    }}
                />
            </div>
        </div>
    )
}