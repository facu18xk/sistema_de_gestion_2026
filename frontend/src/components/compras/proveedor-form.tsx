"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { FormContainer } from "@/components/FormContainer"
import { FieldWrapper } from "@/components/FieldWrapper"

export interface Proveedor {
  id?: string;
  razonSocial: string;
  nombreFantasia: string;
  ruc: string;
  direccion: string;
}

interface ProveedorFormProps {
  proveedorEditado?: Proveedor | null
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

  useEffect(() => {
    if (proveedorEditado) {
      setFormData(proveedorEditado)
    }
  }, [proveedorEditado])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <FormContainer
      onSubmit={(e) => { e.preventDefault(); onSubmit(formData) }}
      onCancel={onCancel}
      isEditing={!!proveedorEditado}
      submitText={{
        save: "Registrar Proveedor",
        update: "Actualizar Proveedor"
      }}
    >
      <FieldWrapper id="razonSocial" label="Razón Social">
        <Input
          id="razonSocial"
          value={formData.razonSocial}
          onChange={handleChange}
          placeholder="Ej: Neumáticos del Sur S.A."
          required
        />
      </FieldWrapper>

      <FieldWrapper id="nombreFantasia" label="Nombre de Fantasía">
        <Input
          id="nombreFantasia"
          value={formData.nombreFantasia}
          onChange={handleChange}
          placeholder="Ej: Mega Tires"
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWrapper id="ruc" label="RUC">
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={handleChange}
            placeholder="80000000-0"
            required
          />
        </FieldWrapper>

        <FieldWrapper id="direccion" label="Dirección">
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ciudad, Calle, Nro"
          />
        </FieldWrapper>
      </div>
    </FormContainer>
  )
}