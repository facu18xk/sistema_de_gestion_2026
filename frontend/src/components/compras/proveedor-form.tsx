"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"

export interface Proveedor {
  id?: string
  razonSocial: string
  nombreFantasia: string
  ruc: string
  direccion: string
  telefono: string
  email: string
  contactoNombre: string
}

interface ProveedorFormProps {
  proveedorEditado?: Proveedor | null
  onSubmit: (data: Proveedor) => void
  onCancel: () => void
}

export function ProveedorForm({
  proveedorEditado,
  onSubmit,
  onCancel
}: ProveedorFormProps) {
  const [formData, setFormData] = useState<Proveedor>({
    razonSocial: "",
    nombreFantasia: "",
    ruc: "",
    direccion: "",
    telefono: "",
    email: "",
    contactoNombre: "",
  })

  useEffect(() => {
    if (proveedorEditado) {
      setFormData(proveedorEditado)
    } else {
      setFormData({
        razonSocial: "", nombreFantasia: "", ruc: "", direccion: "",
        telefono: "", email: "", contactoNombre: "",
      })
    }
  }, [proveedorEditado])

  const updateField = (id: keyof Proveedor, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FormContainer
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}
      onCancel={onCancel}
      isEditing={!!proveedorEditado}
      submitText={{ save: "Registrar Proveedor", update: "Actualizar Proveedor" }}
    >
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="nombreFantasia" label="Nombre de Fantasía">
          <Input
            id="nombreFantasia"
            value={formData.nombreFantasia}
            onChange={(e) => updateField("nombreFantasia", e.target.value)}
            placeholder="Ej: McQueen Tires"
            required
          />
        </FieldWrapper>

        <FieldWrapper id="ruc" label="RUC">
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={(e) => updateField("ruc", e.target.value)}
            placeholder="Ej: 80012345-6"
            required
          />
        </FieldWrapper>
      </div>

      <FieldWrapper id="razonSocial" label="Razón Social">
        <Input
          id="razonSocial"
          value={formData.razonSocial}
          onChange={(e) => updateField("razonSocial", e.target.value)}
          placeholder="Ej: Distribuidora McQueen S.A."
          required
        />
      </FieldWrapper>

      <FieldWrapper id="contactoNombre" label="Persona de Contacto">
        <Input
          id="contactoNombre"
          value={formData.contactoNombre}
          onChange={(e) => updateField("contactoNombre", e.target.value)}
          placeholder="Ej: Ing. Marcos"
        />
      </FieldWrapper>

      <FieldWrapper id="direccion" label="Dirección">
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => updateField("direccion", e.target.value)}
          placeholder="Avda. Principal c/ Calle 2"
        />
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="email" label="Email">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="ventas@proveedor.com"
          />
        </FieldWrapper>

        <FieldWrapper id="telefono" label="Teléfono">
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="021 555 000"
          />
        </FieldWrapper>
      </div>
    </FormContainer>
  )
}