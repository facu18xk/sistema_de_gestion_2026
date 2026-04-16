"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


// Definimos la estructura del proveedor para TypeScript
export interface Empleado {
  id?: string
  nombre: string
  apellido: string
  ciRuc: string
  fechaIngreso: string
  salario: string
  cargo: string
}

interface EmpleadoFormProps {
  empleadoEditado?: Empleado | null //Si viene un empleado, es modo edición
  onSubmit: (data: Empleado) => void
  onCancel: () => void
}

export function EmpleadoForm({ 
    empleadoEditado, 
    onSubmit, 
    onCancel 
}: EmpleadoFormProps) {
  const [formData, setFormData] = useState<Empleado>({
    nombre: "",
    apellido: "",
    ciRuc: "",
    fechaIngreso: "",
    salario: "",
    cargo: "",
  })

  // Si empleadoEditado cambia (porque abrimos uno para editar), actualizamos el formulario
  useEffect(() => {
    if (empleadoEditado) {
      setFormData(empleadoEditado)
    }
  }, [empleadoEditado])

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
        <Label htmlFor="fechaIngreso">Fecha de Ingreso</Label>
        <Input 
          id="fechaIngreso"
          type="date"
          value={formData.fechaIngreso} 
          onChange={handleChange} 
          placeholder=""
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Salario</Label>
        <Input 
          id="salario" 
          type="number"
          value={formData.salario} 
          onChange={handleChange} 
          placeholder="Ej: 3000000"
          required 
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="telefono">Cargo</Label>
        <Input 
          id="cargo" 
          value={formData.cargo} 
          onChange={handleChange} 
          placeholder="Ej: Vendedor"
          required
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {empleadoEditado ? "Actualizar Empleado" : "Registrar Empleado"}
        </Button>
      </div>
    </form>
  )
}