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
import { productosAPI } from "@/services/productosAPI"

export interface PedidoItem {
  id: number
  cantidad: number
  descripcion: string
  categoria: string
  ultimoPrecio: number
}

export interface Pedido {
  id?: string
  nroPedido: string
  fecha: string
  estado: string
  items: PedidoItem[]
}

interface Props {
  pedidoEditado?: Pedido | null
  onSubmit: (data: Pedido) => void
  onCancel: () => void
}

export function PedidoForm({ pedidoEditado, onSubmit, onCancel }: Props) {

  const [formData, setFormData] = useState<Pedido>({
    nroPedido: "",
    fecha: "",
    estado: "Pendiente",
    items: [],
  })

  const [productos, setProductos] = useState<ProductoSeleccionable[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [vista, setVista] = useState<"pedido" | "agregar-productos">("pedido")

  const cargarProductos = async () => {
    const res = await productosAPI.getAll()

    const mapeados = res.map((p: any) => ({
      id: p.idProducto,
      descripcion: p.descripcion,
      marca: p.marca,
      categoria: p.categoria,
      precio: p.precio,
      disponible: p.stock,
    }))
  }

  useEffect(() => {
    cargarProductos()
  }, [currentPage])

  const updateField = (field: keyof Pedido, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateItem = (index: number, field: keyof PedidoItem, value: any) => {
    const items = [...formData.items]
    items[index] = { ...items[index], [field]: value }
    setFormData((prev) => ({ ...prev, items }))
  }

  if (vista === "agregar-productos") {
    return (
      <AgregarProductosView
        productos={productos}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onCancel={() => setVista("pedido")}
        onNuevoProducto={() => {}}
        onCargarProductos={(productosSeleccionados: ProductoSeleccionadoParaPedido[]) => {

          const nuevosItems = productosSeleccionados.map((p) => ({
            id: Date.now() + p.id,
            cantidad: p.cantidad,
            descripcion: p.descripcion,
            categoria: p.categoria,
            ultimoPrecio: p.precio,
          }))

          setFormData((prev) => ({
            ...prev,
            items: [...prev.items, ...nuevosItems],
          }))

          setVista("pedido")
        }}
      />
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
      submitText={{ save: "Guardar", update: "Actualizar" }}
    >

      <FieldWrapper label="Nro Pedido" id="nroPedido">
        <Input
          value={formData.nroPedido}
          onChange={(e) => updateField("nroPedido", e.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Fecha" id="fecha">
        <Input
          type="date"
          value={formData.fecha}
          onChange={(e) => updateField("fecha", e.target.value)}
        />
      </FieldWrapper>

      <div className="flex justify-end">
      <Button type="button" onClick={() => setVista("agregar-productos")} className="w-auto px-4">
        Agregar productos
      </Button>
      </div>

      <PedidoItemsTable
        items={formData.items}
        onUpdateItem={updateItem}
      />

    </FormContainer>
  )
}