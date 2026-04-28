"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react"
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

interface ProductoFormProps {
  productoEditado?: ProductoDTO | null; //Si viene un producto, es modo edición
  categorias: { idCategoria: number; nombre: string }[];
  marcas: { idMarca: number; nombre: string }[];
  onSubmit: (data: ProductoSaveDTO) => void;
  onCancel: () => void;
  onRefreshData: () => Promise<void>;
}

export function ProductoForm({
  productoEditado,
  categorias,
  marcas,
  onSubmit,
  onCancel,
  onRefreshData,
}: ProductoFormProps) {
  const [formData, setFormData] = useState<ProductoFormState>({
    descripcion: "",
    idMarca: "",
    idCategoria: "",
    precioUnitario: 0,
    esServicio: false,
    porcentajeIva: "10", // Valor por defecto en Paraguay
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"marca" | "categoria" | null>(null);
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [resetKey, setResetKey] = useState(0);

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

  const handleAddNewBrandOrCategory = async () => {
    if (!newValue.trim()) return;
    setIsAdding(true);
    try {
      if (dialogType === "marca") {
        const response = await marcasAPI.create({ nombre: newValue});
        const createdItem = response;
        if (onRefreshData) {
          await onRefreshData(); 
        }
        updateField("idMarca", createdItem.idMarca.toString());
      } else if (dialogType === "categoria") {
        const response = await categoriasAPI.create({ nombre: newValue});
        const createdItem = response;
        if (onRefreshData) {
          await onRefreshData(); 
        }
        updateField("idCategoria", createdItem.idCategoria.toString());
      }
      setIsDialogOpen(false);
      setNewValue("");
      notify.success("Agregado", "Registro creado correctamente");
    } catch (error) {
      notify.error("Error", "No se pudo guardar");
    } finally {
      setIsAdding(false);
    }
  }

  const cerrarDialogo = () => {
    if (dialogType === "marca") {
      updateField("idMarca", "");
    } else if (dialogType === "categoria") {
      updateField("idCategoria", "");
    }
    setResetKey(prev => prev + 1);
    setIsDialogOpen(false);
    setDialogType(null);
    setNewValue("");
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
            placeholder="Ej: Neumático Radial 17"
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/*MARCA*/}
          <div className="grid gap-2">
            <Label htmlFor="marca">Marca</Label>
            <Select
                key={`marca-${formData.idMarca}-${marcas.length}-${resetKey}`}
                value={formData.idMarca || undefined}
                onValueChange={(value) => {
                  if (value === "ADD_NEW") {
                    setDialogType("marca");
                    setTimeout(() => {
                      setIsDialogOpen(true);
                    }, 100);
                  } else {
                    updateField("idMarca", value);
                  }
                }}
                required
              >
                <SelectTrigger id="idMarca" className="w-full">
                  <SelectValue placeholder="Seleccionar marca">
                    {marcaSeleccionada}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent onPointerDownOutside={(e) => {if(dialogType) e.preventDefault();}}>
                <SelectItem value="ADD_NEW" className="text-primary font-bold">
                  + Nueva Marca
                </SelectItem>
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
                key={`categoria-${formData.idCategoria}-${categorias.length}-${resetKey}`}
                value={formData.idCategoria || undefined}
                onValueChange={(value) => {
                  if (value === "ADD_NEW") {
                    setDialogType("categoria");
                    setTimeout(() => {
                      setIsDialogOpen(true);
                    }, 100);
                  } else {
                    updateField("idCategoria", value)
                  }
                }}
                required
              >
                <SelectTrigger id="idCategoria" className="w-full">
                  <SelectValue placeholder="Seleccionar categoría">
                    {categoriaSeleccionada}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent onPointerDownOutside={(e) => {if(dialogType) e.preventDefault();}}>
                <SelectItem value="ADD_NEW" className="text-primary font-bold">
                  + Nueva Categoría
                </SelectItem>
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
      {/*ALERT DIALOG PARA MARCA/CATEGORÍA*/}
      <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) cerrarDialogo();
      }}>
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
          onEscapeKeyDown={(e) => e.stopPropagation()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              Agregar nueva {dialogType === "marca" ? "Marca" : "Categoría"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa el nombre del nuevo registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Ej: Samsung, Neumáticos, etc."
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cerrarDialogo}>
                Cancelar
            </AlertDialogCancel>
            <Button 
              onClick={handleAddNewBrandOrCategory}
              disabled={isAdding || !newValue.trim()}
              className="cursor-pointer"
            >
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}