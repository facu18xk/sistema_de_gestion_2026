"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Definimos la estructura del producto para TypeScript
interface Producto {
  id?: string
  descripcion: string
  marca: string
  categoria: string
  precio: number
  cantidad: number
}

interface ProductoFormProps {
  productoEditado?: Producto | null // Si viene un producto, es modo edición
  onSubmit: (data: Producto) => void
  onCancel: () => void
}

export function ProductoForm({ productoEditado, onSubmit, onCancel }: ProductoFormProps) {
  // Estado inicial dinámico
  const [formData, setFormData] = useState<Producto>({
    descripcion: "",
    marca: "",
    categoria: "",
    precio: 0,
    cantidad: 0,
  })

  // Si productoEditado cambia (porque abrimos uno para editar), actualizamos el formulario
  useEffect(() => {
    if (productoEditado) {
      setFormData(productoEditado)
    }
  }, [productoEditado])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input 
          id="descripcion" 
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          placeholder="Ej: Neumático Radial 17" 
          required 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="marca">Marca</Label>
          <Input 
            id="marca" 
            value={formData.marca}
            onChange={(e) => setFormData({...formData, marca: e.target.value})}
            placeholder="McQueen" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Input 
            id="categoria" 
            value={formData.categoria}
            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            placeholder="Pista" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="precio">Precio Unitario</Label>
          <Input 
            id="precio" 
            type="number" 
            step="0.01"
            value={formData.precio}
            onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cantidad">Stock</Label>
          <Input 
            id="cantidad" 
            type="number" 
            value={formData.cantidad}
            onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {productoEditado ? "Actualizar Producto" : "Guardar Producto"}
        </Button>
      </div>
    </form>
  )
}