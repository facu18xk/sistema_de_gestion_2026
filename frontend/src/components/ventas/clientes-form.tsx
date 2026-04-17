"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"

export interface Cliente {
  id?: string
  nombre: string
  apellido: string
  ciRuc: string
  direccion: string
  email: string
  telefono: string
}

interface ClienteFormProps {
  clienteEditado?: Cliente | null
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

  useEffect(() => {
    if (clienteEditado) {
      setFormData(clienteEditado)
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        ciRuc: "",
        direccion: "",
        email: "",
        telefono: "",
      })
    }
  }, [clienteEditado])

  const updateField = (id: keyof Cliente, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FormContainer
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}
      onCancel={onCancel}
      isEditing={!!clienteEditado}
      submitText={{ save: "Registrar Cliente", update: "Actualizar Cliente" }}
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

      <FieldWrapper id="direccion" label="Dirección">
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => updateField("direccion", e.target.value)}
          placeholder="Ciudad, Calle, Nro"
        />
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="email" label="Email">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Ej: cliente@email.com"
          />
        </FieldWrapper>

        <FieldWrapper id="telefono" label="Teléfono">
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="Ej: 0981 123456"
          />
        </FieldWrapper>
      </div>
    </FormContainer>
  )
}