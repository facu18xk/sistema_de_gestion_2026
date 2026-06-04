"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductoDTO, ProductoSaveDTO, ProductoFormState } from "@/types/types";
import { formatNumberDots } from "@/utils/money-format";
import { notify } from "@/lib/notifications"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"

interface ServicioFormProps {
  servicioEditado?: ProductoDTO | null; //Si viene un producto, es modo edición
  onSubmit: (data: ProductoSaveDTO) => void;
  onCancel: () => void;
}

export function ServicioForm({
  servicioEditado,
  onSubmit,
  onCancel,
}: ServicioFormProps) {
  const [formData, setFormData] = useState<ProductoFormState>({
    descripcion: "",
    idMarca: "14", //Servicio
    idCategoria: "9", //Servicio
    precioUnitario: 0,
    esServicio: true,
    porcentajeIva: "5", // Por defecto cobraremos 5%
  });

  useEffect(() => {
    if (servicioEditado) {
      //console.log(`Producto editar: `, productoEditado);
      // Forzamos la actualización del estado con los datos del DTO de lectura
      setFormData({
        descripcion: servicioEditado.descripcion,
        idMarca: "14", //Servicio
        idCategoria: "9", //Servicio
        precioUnitario: servicioEditado.precioUnitario,
        esServicio: servicioEditado.esServicio,
        porcentajeIva: String(servicioEditado.porcentajeIva),
      });
    } else {
      // Resetear si es nuevo
      setFormData({
        descripcion: "",
        idMarca: "14",
        idCategoria: "9",
        precioUnitario: 0,
        esServicio: true,
        porcentajeIva: "5",
      });
    }
  }, [servicioEditado]);

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
    <>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/*DESCRIPCIÓN*/}
        <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input 
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => updateField("descripcion", e.target.value)}
            placeholder="Ej: Alineación y Balanceo"
            required 
          />
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
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancelar
          </Button>
          <Button type="submit" className="cursor-pointer">
            {servicioEditado ? "Actualizar Servicio" : "Guardar Servicio"}
          </Button>
        </div>
      </form>
    </>
  );
}