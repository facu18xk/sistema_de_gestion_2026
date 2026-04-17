"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"

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
  empleadoEditado?: Empleado | null
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

  useEffect(() => {
    if (empleadoEditado) {
      setFormData(empleadoEditado)
    } else {
      setFormData({
        nombre: "", apellido: "", ciRuc: "", fechaIngreso: "", salario: "", cargo: "",
      })
    }
  }, [empleadoEditado])

  const updateField = (id: keyof Empleado, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FormContainer
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}
      onCancel={onCancel}
      isEditing={!!empleadoEditado}
      submitText={{ save: "Registrar Empleado", update: "Actualizar Empleado" }}
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="nombre" label="Nombre">
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Ej: Juan"
            required
          />
        </FieldWrapper>

        <FieldWrapper id="apellido" label="Apellido">
          <Input
            id="apellido"
            value={formData.apellido}
            onChange={(e) => updateField("apellido", e.target.value)}
            placeholder="Ej: Pérez"
            required
          />
        </FieldWrapper>
      </div>

      <FieldWrapper id="ciRuc" label="CI/RUC">
        <Input
          id="ciRuc"
          value={formData.ciRuc}
          onChange={(e) => updateField("ciRuc", e.target.value)}
          placeholder="Ej: 5454544"
          required
        />
      </FieldWrapper>

      <FieldWrapper id="fechaIngreso" label="Fecha de Ingreso">
        <Input
          id="fechaIngreso"
          type="date"
          value={formData.fechaIngreso}
          onChange={(e) => updateField("fechaIngreso", e.target.value)}
          required
        />
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="salario" label="Salario">
          <Input
            id="salario"
            type="number"
            value={formData.salario}
            onChange={(e) => updateField("salario", e.target.value)}
            placeholder="Ej: 3000000"
            required
          />
        </FieldWrapper>

        <FieldWrapper id="cargo" label="Cargo">
          <Input
            id="cargo"
            value={formData.cargo}
            onChange={(e) => updateField("cargo", e.target.value)}
            placeholder="Ej: Vendedor"
            required
          />
        </FieldWrapper>
      </div>
    </FormContainer>
  )
}