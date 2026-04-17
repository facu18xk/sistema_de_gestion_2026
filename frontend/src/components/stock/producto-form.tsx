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
import { ProductoDTO, ProductoSaveDTO } from "@/types/types"

interface ProductoFormProps {
  productoEditado?: ProductoDTO | null
  categorias: { idCategoria: number, nombre: string }[]
  marcas: { idMarca: number, nombre: string }[]
  onSubmit: (data: ProductoSaveDTO) => void
  onCancel: () => void
}

export function ProductoForm({
  productoEditado,
  categorias,
  marcas,
  onSubmit,
  onCancel
}: ProductoFormProps) {
  // El estado del formulario debe coincidir con lo que el Backend espera recibir (SaveDTO)
  const [formData, setFormData] = useState<ProductoSaveDTO>({
    descripcion: "",
    idMarca: 0,
    idCategoria: 0,
    precioUnitario: 0,
    esServicio: false,
    porcentajeIva: 10, // Valor por defecto común en Paraguay
  })

  useEffect(() => {
    if (productoEditado) {
      console.log(`Producto editar: `, productoEditado);
      // Forzamos la actualización del estado con los datos del DTO de lectura
      setFormData({
        descripcion: productoEditado.descripcion,
        idMarca: productoEditado.idMarca,
        idCategoria: productoEditado.idCategoria,
        precioUnitario: productoEditado.precioUnitario,
        esServicio: productoEditado.esServicio,
        porcentajeIva: (productoEditado.porcentajeIva * 100) || 10,
      });
    } else {
      // Resetear si es nuevo
      setFormData({
        descripcion: "",
        idMarca: 0,
        idCategoria: 0,
        precioUnitario: 0,
        esServicio: false,
        porcentajeIva: 10,
      });
    }
  }, [productoEditado])

const updateField = (id: keyof ProductoSaveDTO, value: any) => {
  setFormData((prev) => ({ ...prev, [id]: value }))
}

/*console.log("Datos para selects:", { 
  marcasDisponibles: marcas, 
  idSeleccionado: formData.idMarca,
  tipoId: typeof formData.idMarca 
});*/

return (
  <FormContainer
    onSubmit={(e) => { 
      e.preventDefault(); 
      onSubmit(formData); 
    }}
    onCancel={onCancel}
    isEditing={!!productoEditado}
    submitText={{ save: "Guardar Producto", update: "Actualizar Producto" }}
  >
    <div className="grid gap-4">
      {/* DESCRIPCIÓN */}
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
        <FieldWrapper id="idMarca" label="Marca">
          <Select
            // Select requiere strings para el value, convertimos el ID
            value={formData.idMarca === 0 ? undefined : formData.idMarca.toString()}
            onValueChange={(value) => updateField("idMarca", parseInt(value))}
            required
          >
            <SelectTrigger id="idMarca" className="w-full">
              <SelectValue placeholder="Seleccionar marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((m) => (
                <SelectItem key={m.idMarca} value={m.idMarca.toString()}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        {/* CATEGORÍA */}
        <FieldWrapper id="idCategoria" label="Categoría">
          <Select
            value={formData.idCategoria === 0 ? undefined : formData.idCategoria.toString()}
            onValueChange={(value) => updateField("idCategoria", parseInt(value))}
            required
          >
            <SelectTrigger id="idCategoria" className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.idCategoria} value={cat.idCategoria.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* PRECIO UNITARIO */}
      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper id="precioUnitario" label="Precio Unitario">
          <Input
            type="number"
            step="100"
            value={formData.precioUnitario}
            onChange={(e) => updateField("precioUnitario", parseFloat(e.target.value) || 0)}
            required
          />
        </FieldWrapper>

        {/* PORCENTAJE IVA */}
        <FieldWrapper id="porcentajeIva" label="IVA (%)">
          <Select
            value={formData.porcentajeIva?.toString() || "10"}
            onValueChange={(value) => updateField("porcentajeIva", parseInt(value))}
            required
          >
            <SelectTrigger id="porcentajeIva">
              <SelectValue placeholder="IVA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Exenta (0%)</SelectItem>
              <SelectItem value="5">IVA 5%</SelectItem>
              <SelectItem value="10">IVA 10%</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>
    </div>
  </FormContainer>
  )
}