"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { FormContainer } from "@/components/FormContainer";
import { FieldWrapper } from "@/components/FieldWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductoDTO, ProductoSaveDTO } from "@/types/types";

interface ProductoFormState
  extends Omit<ProductoSaveDTO, "idMarca" | "idCategoria"> {
  idMarca: string;
  idCategoria: string;
  porcentajeIva: string;
}

interface ProductoFormProps {
  productoEditado?: ProductoDTO | null;
  categorias: { idCategoria: number; nombre: string }[];
  marcas: { idMarca: number; nombre: string }[];
  onSubmit: (data: ProductoSaveDTO) => void;
  onCancel: () => void;
}

export function ProductoForm({
  productoEditado,
  categorias,
  marcas,
  onSubmit,
  onCancel,
}: ProductoFormProps) {
  // El estado del formulario debe coincidir con lo que el Backend espera recibir (SaveDTO)
  const [formData, setFormData] = useState<ProductoFormState>({
    descripcion: "",
    idMarca: "",
    idCategoria: "",
    precioUnitario: 0,
    esServicio: false,
    porcentajeIva: "10", // Valor por defecto común en Paraguay
  });

  useEffect(() => {
    if (productoEditado) {
      console.log(`Producto editar: `, productoEditado);
      // Forzamos la actualización del estado con los datos del DTO de lectura
      setFormData({
        descripcion: productoEditado.descripcion,
        idMarca: productoEditado.idMarca.toString(),
        idCategoria: productoEditado.idCategoria.toString(),
        precioUnitario: productoEditado.precioUnitario,
        esServicio: productoEditado.esServicio,
        porcentajeIva: String(productoEditado.porcentajeIva * 100 || 10),
      });
    } else {
      // Resetear si es nuevo
      setFormData({
        descripcion: "",
        idMarca: "",
        idCategoria: "",
        precioUnitario: 0,
        esServicio: false,
        porcentajeIva: "10",
      });
    }
  }, [productoEditado]);

  const marcaSeleccionada =
    marcas.find((m) => m.idMarca.toString() === formData.idMarca)?.nombre ?? "";
  const categoriaSeleccionada =
    categorias.find((cat) => cat.idCategoria.toString() === formData.idCategoria)
      ?.nombre ?? "";

  const updateField = (
    id: keyof ProductoFormState,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /*console.log("Datos para selects:", { 
      marcasDisponibles: marcas, 
      idSeleccionado: formData.idMarca,
      tipoId: typeof formData.idMarca 
    });*/

  return (
    <FormContainer
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...formData,
          idMarca: Number.parseInt(formData.idMarca, 10),
          idCategoria: Number.parseInt(formData.idCategoria, 10),
          porcentajeIva: Number.parseInt(formData.porcentajeIva, 10),
        });
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
              key={`marca-${formData.idMarca}-${marcas.length}`}
              value={formData.idMarca || undefined}
              onValueChange={(value) => updateField("idMarca", value)}
              required
            >
              <SelectTrigger id="idMarca" className="w-full">
                <SelectValue placeholder="Seleccionar marca">
                  {marcaSeleccionada}
                </SelectValue>
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
              key={`categoria-${formData.idCategoria}-${categorias.length}`}
              value={formData.idCategoria || undefined}
              onValueChange={(value) => updateField("idCategoria", value)}
              required
            >
              <SelectTrigger id="idCategoria" className="w-full">
                <SelectValue placeholder="Seleccionar categoría">
                  {categoriaSeleccionada}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem
                    key={cat.idCategoria}
                    value={cat.idCategoria.toString()}
                  >
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
              onChange={(e) =>
                updateField("precioUnitario", parseFloat(e.target.value) || 0)
              }
              required
            />
          </FieldWrapper>

          {/* PORCENTAJE IVA */}
          <FieldWrapper id="porcentajeIva" label="IVA (%)">
            <Select
              key={`iva-${formData.porcentajeIva}`}
              value={formData.porcentajeIva || "10"}
              onValueChange={(value) => updateField("porcentajeIva", value)}
              required
            >
              <SelectTrigger id="porcentajeIva">
                <SelectValue placeholder="IVA">{`IVA ${formData.porcentajeIva}%`}</SelectValue>
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
  );
}
