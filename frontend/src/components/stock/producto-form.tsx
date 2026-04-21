"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductoDTO, ProductoSaveDTO, ProductoFormState } from "@/types/types";
import { formatNumberDots } from "@/utils/money-format";

interface ProductoFormProps {
  productoEditado?: ProductoDTO | null; //Si viene un producto, es modo edición
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
  const [formData, setFormData] = useState<ProductoFormState>({
    descripcion: "",
    idMarca: "",
    idCategoria: "",
    precioUnitario: 0,
    esServicio: false,
    porcentajeIva: "10", // Valor por defecto en Paraguay
  });

  useEffect(() => {
    if (productoEditado) {
      //console.log(`Producto editar: `, productoEditado);
      // Forzamos la actualización del estado con los datos del DTO de lectura
      setFormData({
        descripcion: productoEditado.descripcion,
        idMarca: productoEditado.idMarca.toString(),
        idCategoria: productoEditado.idCategoria.toString(),
        precioUnitario: productoEditado.precioUnitario,
        esServicio: productoEditado.esServicio,
        porcentajeIva: String(productoEditado.porcentajeIva),
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

  const marcaSeleccionada = marcas.find((m) => m.idMarca.toString() === formData.idMarca)?.nombre ?? "";
  const categoriaSeleccionada = categorias.find((cat) => cat.idCategoria.toString() === formData.idCategoria)?.nombre ?? "";

  const updateField = (
    id: keyof ProductoFormState,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
          ...formData,
          precioUnitario: formData.precioUnitario,
          idMarca: Number.parseInt(formData.idMarca, 10),
          idCategoria: Number.parseInt(formData.idCategoria, 10),
          porcentajeIva: Number.parseInt(formData.porcentajeIva, 10),
        });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/*DESCRIPCIÓN*/}
      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Input 
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => updateField("descripcion", e.target.value)}
          placeholder="Ej: Neumático Radial 17"
          required 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/*MARCA*/}
        <div className="grid gap-2">
          <Label htmlFor="marca">Marca</Label>
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
        </div>
        {/*CATEGORÍA*/}
        <div className="grid gap-2">
          <Label htmlFor="categoria">Categoría</Label>
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
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/*PRECIO UNITARIO*/}
        <div className="grid gap-2">
          <Label htmlFor="precio">Precio Unitario (₲)</Label>
          <Input
            type="text"
            inputMode="numeric" // Muestra el teclado numérico en móviles
            value={formatNumberDots(formData.precioUnitario)} // Formatea el número del estado a "1.000"
            onChange={(e) => {
              // 1. Eliminamos todo lo que no sea un número (limpiamos los puntos)
              const rawValue = e.target.value.replace(/\D/g, ""); 
              // 2. Lo guardamos como número en el estado
              updateField("precioUnitario", parseInt(rawValue) || 0);
            }}
            required
          />
        </div>
        {/*PORCENTAJE IVA*/}
        <div className="grid gap-2">
          <Label htmlFor="precio">IVA (%)</Label>
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
        </div>
      </div>
      {/*BOTONES*/}
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
          Cancelar
        </Button>
        <Button type="submit" className="cursor-pointer">
          {productoEditado ? "Actualizar Producto" : "Guardar Producto"}
        </Button>
      </div>
    </form>
  );
}