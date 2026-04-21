"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Proveedor, Pais, Ciudad } from "@/types/types";
import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { Loader2 } from "lucide-react";

interface ProveedorFormProps {
  proveedorEditado?: Proveedor | null;
  paises: Pais[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProveedorForm({
  proveedorEditado,
  paises,
  onSubmit,
  onCancel,
}: ProveedorFormProps) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombreFantasia: "",
    razonSocial: "",
    ruc: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    idPais: "",
    idCiudad: "",
    calle1: "",
    calle2: "",
    descripcionDireccion: "",
  });

  // 1. Efecto para cargar los datos cuando se entra en modo Edición
  useEffect(() => {
    if (proveedorEditado) {
      setFormData({
        nombreFantasia: proveedorEditado.nombreFantasia || "",
        razonSocial: proveedorEditado.razonSocial || "",
        ruc: proveedorEditado.ruc || "",
        nombres: proveedorEditado.nombres || "",
        apellidos: proveedorEditado.apellidos || "",
        telefono: proveedorEditado.telefono || "",
        correo: proveedorEditado.correo || "",
        idPais: proveedorEditado.direccion?.idPais?.toString() || "",
        idCiudad: proveedorEditado.direccion?.idCiudad?.toString() || "",
        calle1: proveedorEditado.direccion?.calle1 || "",
        calle2: proveedorEditado.direccion?.calle2 || "",
        descripcionDireccion: proveedorEditado.direccion?.descripcion || "",
      });
    }
  }, [proveedorEditado]);

  // 2. Efecto para filtrar ciudades cada vez que el idPais cambie
  useEffect(() => {
    const cargarCiudades = async () => {
      if (!formData.idPais) {
        setCiudades([]);
        return;
      }
      setLoadingLocs(true);
      try {
        // Usamos el nuevo endpoint del backend
        const data = await ubicacionesAPI.getCiudadesPorPais(Number(formData.idPais));
        setCiudades(data);
      } catch (err) {
        console.error("Error al cargar ciudades por país:", err);
      } finally {
        setLoadingLocs(false);
      }
    };

    cargarCiudades();
  }, [formData.idPais]);

  const updateField = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const proveedorFullReq = {
      idProveedor: proveedorEditado?.idProveedor || 0,
      ruc: formData.ruc,
      razonSocial: formData.razonSocial,
      nombreFantasia: formData.nombreFantasia,
      direccion: {
        idDireccion: proveedorEditado?.idDireccion || 0,
        calle1: formData.calle1,
        calle2: formData.calle2 || "",
        descripcion: formData.descripcionDireccion || "",
        idCiudad: Number(formData.idCiudad)
      },
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      correo: formData.correo,
      telefono: formData.telefono,
    };

    // Pasamos el objeto completo al onSubmit de la página
    await onSubmit(proveedorFullReq);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      {/* NOMBRE FANTASIA */}
      <div className="grid gap-2">
        <Label htmlFor="nombreFantasia">Nombre de Fantasía</Label>
        <Input
          id="nombreFantasia"
          value={formData.nombreFantasia}
          onChange={(e) => updateField("nombreFantasia", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ruc">RUC</Label>
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={(e) => updateField("ruc", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="razonSocial">Razón Social</Label>
          <Input
            id="razonSocial"
            value={formData.razonSocial}
            onChange={(e) => updateField("razonSocial", e.target.value)}
            required
          />
        </div>
      </div>

      {/* UBICACIÓN - Aquí está la corrección del filtrado y preselección */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="pais">País</Label>
          <Select
            // El key fuerza el re-render cuando cambia el id para asegurar que se muestre el texto correcto
            key={`pais-${formData.idPais}`}
            value={formData.idPais}
            onValueChange={(value) => {
              updateField("idPais", value);
              updateField("idCiudad", ""); // Resetear ciudad si cambia el país manualmente
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar país" />
            </SelectTrigger>
            <SelectContent>
              {paises.map((p) => (
                <SelectItem key={p.idPais} value={p.idPais.toString()}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Select
            key={`ciudad-${formData.idCiudad}-${ciudades.length}`}
            value={formData.idCiudad}
            onValueChange={(value) => updateField("idCiudad", value)}
            disabled={!formData.idPais || loadingLocs}
            required
          >
            <SelectTrigger>
              {loadingLocs ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando...</span>
                </div>
              ) : (
                <SelectValue placeholder="Seleccionar ciudad" />
              )}
            </SelectTrigger>
            <SelectContent>
              {ciudades.map((c) => (
                <SelectItem key={c.idCiudad} value={c.idCiudad.toString()}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="calle1">Calle Principal</Label>
          <Input
            id="calle1"
            value={formData.calle1}
            onChange={(e) => updateField("calle1", e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="calle2">Calle Secundaria / Nro</Label>
          <Input
            id="calle2"
            value={formData.calle2}
            onChange={(e) => updateField("calle2", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="nombres">Nombres del contacto</Label>
          <Input
            id="nombres"
            value={formData.nombres}
            onChange={(e) => updateField("nombres", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            id="apellidos"
            value={formData.apellidos}
            onChange={(e) => updateField("apellidos", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="correo">Correo</Label>
          <Input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => updateField("correo", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
          />
        </div>
      </div>

      {/* BOTONES - Diseño idéntico a ProductoForm */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {proveedorEditado ? "Actualizar Proveedor" : "Guardar Proveedor"}
        </Button>
      </div>
    </form>
  );
}