"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface Producto {
  id?: string
  descripcion: string
  marca: string
  categoria: string
  precio: number
  cantidad: number
}

interface ProductoFormProps {
  productoEditado?: Producto | null
  categorias: string[]
  marcas: string[]
  onSubmit: (data: Producto) => void
  onCancel: () => void
}

export function ProductoForm({
  productoEditado,
  categorias,
  marcas,
  onSubmit,
  onCancel
}: ProductoFormProps) {
  const [formData, setFormData] = useState<Producto>({
    descripcion: "",
    marca: "",
    categoria: "",
    precio: 0,
    cantidad: 0,
  })

  useEffect(() => {
    if (productoEditado) {
      setFormData({
        ...productoEditado,
        marca: productoEditado.marca || "",
        categoria: productoEditado.categoria || "",
      })
    } else {
      setFormData({
        descripcion: "",
        marca: "",
        categoria: "",
        precio: 0,
        cantidad: 0,
      })
    }
  }, [productoEditado])

  const updateField = (id: keyof Producto, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FormContainer
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}
      onCancel={onCancel}
      isEditing={!!productoEditado}
      submitText={{ save: "Guardar Producto", update: "Actualizar Producto" }}
    >
      <div className="grid gap-4">
        <FieldWrapper id="descripcion" label="Descripción">
          <Input
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
            placeholder="Ej: Neumático Radial 17"
            required
          />
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-4">
          {/* MARCA */}
          <FieldWrapper id="marca" label="Marca">
            <Select
              // Si el value no existe en la lista de marcas, mostrará el placeholder
              value={formData.marca}
              onValueChange={(value) => updateField("marca", value)}
            >
              <SelectTrigger id="marca">
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          {/* CATEGORÍA */}
          <FieldWrapper id="categoria" label="Categoría">
            <Select
              value={formData.categoria}
              onValueChange={(value) => updateField("categoria", value)}
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper id="precio" label="Precio Unitario">
            <Input
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) => updateField("precio", parseFloat(e.target.value) || 0)}
            />
          </FieldWrapper>
          <FieldWrapper id="cantidad" label="Stock">
            <Input
              type="number"
              value={formData.cantidad}
              onChange={(e) => updateField("cantidad", parseInt(e.target.value) || 0)}
            />
          </FieldWrapper>
        </div>
      </div>
    </FormContainer>
  )
}