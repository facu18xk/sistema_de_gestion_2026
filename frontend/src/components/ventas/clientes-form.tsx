"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


// Definimos la estructura del proveedor para TypeScript
export interface Cliente {
    id?: string;
    nombre: string;
    apellido: string;
    ciRuc: string;
    direccion: string;
    email: string;
    telefono: string;
  }

interface ClienteFormProps {
  clienteEditado?: Cliente | null //Si viene un cliente, es modo edición
  onSubmit: (data: Cliente) => void
  onCancel: () => void
}

export function ClienteForm({ 
    clienteEditado, 
    onSubmit, 
    onCancel 
}: ClienteFormProps) {
  const [formData, setFormData] = useState<Cliente>({
    nombre: "",
    apellido: "",
    ciRuc: "",
    direccion: "",
    email: "",
    telefono: "",
  })

  // Si clienteEditado cambia (porque abrimos uno para editar), actualizamos el formulario
  useEffect(() => {
    if (clienteEditado) {
      setFormData(clienteEditado)
    }
  }, [clienteEditado])

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
        <Label htmlFor="nombre">Nombre</Label>
        <Input 
          id="nombre" 
          value={formData.nombre} 
          onChange={handleChange} 
          placeholder="Ej: Juan" 
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="apellido">Apellido</Label>
        <Input 
          id="apellido" 
          value={formData.apellido} 
          onChange={handleChange} 
          placeholder="Ej: Pérez" 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ciRuc">CI/RUC</Label>
        <Input 
          id="ruc" 
          value={formData.ciRuc} 
          onChange={handleChange} 
          placeholder="Ej: 5454544" 
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

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={formData.email} 
          onChange={handleChange} 
          placeholder="Ej: cliente@email.com" 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input 
          id="telefono" 
          value={formData.telefono} 
          onChange={handleChange} 
          placeholder="Ej: 0981 123456" 
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {clienteEditado ? "Actualizar Cliente" : "Registrar Cliente"}
        </Button>
      </div>
    </form>
  )
}