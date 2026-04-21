"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"
import { PedidoItemsTable } from "@/components/compras/pedido-item-table"
import {
    AgregarProductosView,
    ProductoSeleccionable,
    ProductoSeleccionadoParaPedido,
} from "@/components/compras/agregar-producto-view"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

import { ProductoForm } from "@/components/stock/producto-form"
import { ProveedorForm } from "@/components/compras/proveedor-form"

import { productosAPI } from "@/services/productosAPI"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI"

import { ProductoDTO, Marca, Categoria, Pais } from "@/types/types"

export interface PedidoItem {
    id: number
    cantidad: number
    descripcion: string
    categoria: string
    ultimoPrecio: number
    subtotal: number
    estado: string
    precioTotal: number
}

export interface Pedido {
    id?: string
    proveedor: string
    nroCotizacion: string
    fecha: string
    estado: string
    items: PedidoItem[]
}

interface PedidosFormProps {
    pedidoEditado?: Pedido | null
    onSubmit: (data: Pedido) => void
    onCancel: () => void
}

export function PedidoForm({
    pedidoEditado,
    onSubmit,
    onCancel
}: PedidosFormProps) {

    const [formData, setFormData] = useState<Pedido>({
        id: "",
        proveedor: "",
        nroCotizacion: "",
        fecha: "",
        estado: "",
        items: [],
    })

    const [sheetProductoOpen, setSheetProductoOpen] = useState(false)
    const [sheetProveedorOpen, setSheetProveedorOpen] = useState(false)
    const [vista, setVista] = useState<"pedido" | "agregar-productos">("pedido")

    // 🔥 DATOS REALES (NO MOCKS)
    const [productos, setProductos] = useState<ProductoDTO[]>([])
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [paises, setPaises] = useState<Pais[]>([])

    useEffect(() => {
        const load = async () => {
            const [p, m, c, pa] = await Promise.all([
                productosAPI.getAll(),
                marcasAPI.getAll(),
                categoriasAPI.getAll(),
                ubicacionesAPI.getPaises(),
            ])

            setProductos(p)
            setMarcas(m)
            setCategorias(c)
            setPaises(pa)
        }

        load()
    }, [])

    useEffect(() => {
        if (pedidoEditado) {
            setFormData(pedidoEditado)
        }
    }, [pedidoEditado])

    const updateField = (id: keyof Pedido, value: string) => {
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const updateItem = (
        index: number,
        field: keyof PedidoItem,
        value: string | number
    ) => {
        const items = [...formData.items]
        items[index] = { ...items[index], [field]: value }

        const cantidad = Number(items[index].cantidad)
        const precio = Number(items[index].ultimoPrecio)

        items[index].subtotal = cantidad * precio
        items[index].precioTotal = cantidad * precio

        setFormData((prev) => ({ ...prev, items }))
    }

    const totalGeneral = formData.items.reduce(
        (acc, item) => acc + Number(item.precioTotal),
        0
    )

    // 🔥 ADAPTADO A TU BACKEND REAL
    const productosDisponibles: ProductoSeleccionable[] = productos.map(p => ({
        id: p.idProducto,
        descripcion: p.descripcion,
        marca: p.marca,
        categoria: p.categoria,
        precio: p.precioUnitario,
        disponible: p.cantidadTotal,
    }))

    if (vista === "agregar-productos") {
        return (
            <>
                <AgregarProductosView
                    productos={productosDisponibles}
                    onCancel={() => setVista("pedido")}
                    onCargarProductos={(productosSeleccionados) => {
                        const nuevosItems = productosSeleccionados.map((p) => ({
                            id: Date.now() + p.id,
                            cantidad: p.cantidad,
                            descripcion: p.descripcion,
                            categoria: p.categoria,
                            ultimoPrecio: p.precio,
                            subtotal: p.cantidad * p.precio,
                            estado: "Pendiente",
                            precioTotal: p.cantidad * p.precio,
                        }))

                        setFormData((prev) => ({
                            ...prev,
                            items: [...prev.items, ...nuevosItems],
                        }))

                        setVista("pedido")
                    }}
                />

                {/* PRODUCTO FORM REAL */}
                <Sheet open={sheetProductoOpen} onOpenChange={setSheetProductoOpen}>
                    <SheetContent className="sm:max-w-[540px] px-6">
                        <SheetHeader>
                            <SheetTitle>Nuevo Producto</SheetTitle>
                        </SheetHeader>

                        <ProductoForm
                            productoEditado={null}
                            categorias={categorias}
                            marcas={marcas}
                            onSubmit={(data) => {
                                productosAPI.create(data)
                                setSheetProductoOpen(false)
                            }}
                            onCancel={() => setSheetProductoOpen(false)}
                        />
                    </SheetContent>
                </Sheet>

                {/* PROVEEDOR FORM FIX */}
                <Sheet open={sheetProveedorOpen} onOpenChange={setSheetProveedorOpen}>
                    <SheetContent className="sm:max-w-[540px] px-6">
                        <SheetHeader>
                            <SheetTitle>Nuevo Proveedor</SheetTitle>
                        </SheetHeader>

                        <ProveedorForm
                            proveedorEditado={null}
                            paises={paises}   // 🔥 FIX CRÍTICO
                            onSubmit={(data) => {
                                console.log(data)
                                setSheetProveedorOpen(false)
                            }}
                            onCancel={() => setSheetProveedorOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            </>
        )
    }

    return (
        <FormContainer
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
            }}
            onCancel={onCancel}
            isEditing={!!pedidoEditado}
        >
            <div className="grid grid-cols-3 gap-4">
                <FieldWrapper id="proveedor" label="Proveedor">
                    <Input
                        value={formData.proveedor}
                        onChange={(e) => updateField("proveedor", e.target.value)}
                    />
                </FieldWrapper>

                <FieldWrapper id="fecha" label="Fecha">
                    <Input
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => updateField("fecha", e.target.value)}
                    />
                </FieldWrapper>

                <FieldWrapper id="estado" label="Estado">
                    <Input
                        value={formData.estado}
                        onChange={(e) => updateField("estado", e.target.value)}
                    />
                </FieldWrapper>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setVista("agregar-productos")}>
                    Agregar Producto
                </Button>

                <Button type="button" onClick={() => setSheetProductoOpen(true)}>
                    Nuevo Producto
                </Button>

                <Button type="button" onClick={() => setSheetProveedorOpen(true)}>
                    Nuevo Proveedor
                </Button>
            </div>

            <PedidoItemsTable
                items={formData.items}
                onUpdateItem={updateItem}
                totalGeneral={totalGeneral}
            />
        </FormContainer>
    )
}