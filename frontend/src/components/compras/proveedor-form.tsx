"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
//import { Proveedor } from "@/types/proveedores"

// Definimos la estructura del proveedor para TypeScript
export interface Proveedor {
    id?: string;
    razonSocial: string;
    nombreFantasia: string;
    ruc: string;
    direccion: string;
  }

interface ProveedorFormProps {
  proveedorEditado?: Proveedor | null //Si viene un proveedor, es modo edición
  onSubmit: (data: Proveedor) => void
  onCancel: () => void
}

export function ProveedorForm({ proveedorEditado, onSubmit, onCancel }: ProveedorFormProps) {
  const [formData, setFormData] = useState<Proveedor>({
    razonSocial: "",
    nombreFantasia: "",
    ruc: "",
    direccion: "",
  })

  // Si proveedorEditado cambia (porque abrimos uno para editar), actualizamos el formulario
  useEffect(() => {
    if (proveedorEditado) {
      setFormData(proveedorEditado)
    }
  }, [proveedorEditado])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      <div className="grid gap-2">
        <Label htmlFor="razonSocial">Razón Social</Label>
        <Input 
          id="razonSocial" 
          value={formData.razonSocial} 
          onChange={handleChange} 
          placeholder="Ej: Neumáticos del Sur S.A." 
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nombreFantasia">Nombre de Fantasía</Label>
        <Input 
          id="nombreFantasia" 
          value={formData.nombreFantasia} 
          onChange={handleChange} 
          placeholder="Ej: Mega Tires" 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ruc">RUC</Label>
        <Input 
          id="ruc" 
          value={formData.ruc} 
          onChange={handleChange} 
          placeholder="80000000-0" 
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input 
          id="direccion" 
          value={formData.direccion} 
          onChange={handleChange} 
          placeholder="Ciudad, Calle, Nro" 
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {proveedorEditado ? "Actualizar Proveedor" : "Registrar Proveedor"}
        </Button>
      </div>
    </form>
  )
}