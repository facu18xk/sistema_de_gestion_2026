"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { Proveedor, Pais, Ciudad, Categoria } from "@/types/types";
import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { categoriasAPI } from "@/services/categoriasAPI";
import { Loader2, Plus, X } from "lucide-react";
import { notify } from "@/lib/notifications";

interface ProveedorFormProps {
  proveedorEditado?: Proveedor | null;
  paises: Pais[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onRefreshPaises: () => void;
}

export function ProveedorForm({
  proveedorEditado,
  paises,
  onSubmit,
  onCancel,
  onRefreshPaises,
}: ProveedorFormProps) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [allCategorias, setAllCategorias] = useState<Categoria[]>([]);
  const [selectedCats, setSelectedCats] = useState<Categoria[]>([]);

  const [loadingLocs, setLoadingLocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectCatValue, setSelectCatValue] = useState<string>("");

  const [showModal, setShowModal] = useState<{ open: boolean; type: "pais" | "ciudad" | "categoria" }>({
    open: false,
    type: "pais",
  });
  const [nuevoNombre, setNuevoNombre] = useState("");

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

  // Memorización para optimizar rendimiento de listas
  const paisesOrdenados = useMemo(() => {
    return [...paises].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [paises]);

  const ciudadesOrdenadas = useMemo(() => {
    return [...ciudades].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [ciudades]);

  const categoriasDisponiblesOrdenadas = useMemo(() => {
    return allCategorias
      .filter(c => !selectedCats.some(s => s.idCategoria === c.idCategoria))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [allCategorias, selectedCats]);

  const updateField = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const cargarCiudades = async (idPais: number, idCiudadASeleccionar?: string) => {
    if (!idPais) return;
    setLoadingLocs(true);
    try {
      const data = await ubicacionesAPI.getCiudadesPorPais(idPais);
      setCiudades(data);
      if (idCiudadASeleccionar) {
        updateField("idCiudad", idCiudadASeleccionar);
      }
    } catch (err) {
      notify.warning("Error", "No se pudieron cargar las ciudades.");
    } finally {
      setLoadingLocs(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await categoriasAPI.getAll();
        setAllCategorias(cats);

        if (proveedorEditado) {
          const idPaisStr = proveedorEditado.direccion?.idPais?.toString() || "";
          const idCiudadStr = proveedorEditado.direccion?.idCiudad?.toString() || "";

          if (proveedorEditado.categorias) {
            setSelectedCats(proveedorEditado.categorias.map(c => ({
              idCategoria: c.idCategoria,
              nombre: c.categoria
            })));
          }

          setFormData({
            nombreFantasia: proveedorEditado.nombreFantasia || "",
            razonSocial: proveedorEditado.razonSocial || "",
            ruc: proveedorEditado.ruc || "",
            nombres: proveedorEditado.nombres || "",
            apellidos: proveedorEditado.apellidos || "",
            telefono: proveedorEditado.telefono || "",
            correo: proveedorEditado.correo || "",
            idPais: idPaisStr,
            idCiudad: idCiudadStr,
            calle1: proveedorEditado.direccion?.calle1 || "",
            calle2: proveedorEditado.direccion?.calle2 || "",
            descripcionDireccion: proveedorEditado.direccion?.descripcion || "",
          });

          if (idPaisStr) await cargarCiudades(Number(idPaisStr), idCiudadStr);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [proveedorEditado]);

  const handleAddCat = (idStr: string) => {
    if (!idStr) return;
    if (idStr === "ADD_NEW_CAT") {
      setShowModal({ open: true, type: "categoria" });
    } else {
      const cat = allCategorias.find(c => c.idCategoria.toString() === idStr);
      if (cat && !selectedCats.some(s => s.idCategoria === cat.idCategoria)) {
        setSelectedCats([...selectedCats, cat]);
      }
    }
    setTimeout(() => setSelectCatValue(""), 0);
  };

  const handleConfirmarCreacion = async () => {
    if (!nuevoNombre.trim()) return;
    try {
      if (showModal.type === "pais") {
        const nuevo = await ubicacionesAPI.createPais({ nombre: nuevoNombre.trim() });
        await onRefreshPaises();
        setFormData(prev => ({ ...prev, idPais: nuevo.idPais.toString(), idCiudad: "" }));
      } else if (showModal.type === "ciudad") {
        const nueva = await ubicacionesAPI.createCiudad({ nombre: nuevoNombre.trim(), idPais: Number(formData.idPais) });
        await cargarCiudades(Number(formData.idPais), nueva.idCiudad.toString());
      } else if (showModal.type === "categoria") {
        const nueva = await categoriasAPI.create(nuevoNombre.trim());
        const actualizado = await categoriasAPI.getAll();
        setAllCategorias(actualizado);
        setSelectedCats(prev => [...prev, nueva]);
      }
      notify.success("Éxito", "Guardado correctamente.");
    } catch (error) {
      notify.error("Error", "No se pudo realizar la creación.");
    } finally {
      setNuevoNombre("");
      setShowModal({ ...showModal, open: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        idCategorias: selectedCats.map(c => c.idCategoria)
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando formulario...</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm overflow-y-auto max-h-[85vh] px-2">
        {/* IDENTIFICACIÓN */}
        <div className="grid gap-2">
          <Label htmlFor="nombreFantasia">Nombre de Fantasía</Label>
          <Input
            id="nombreFantasia"
            value={formData.nombreFantasia}
            onChange={e => updateField("nombreFantasia", e.target.value)}
            placeholder="Ej: Distribuidora Central"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input id="ruc" value={formData.ruc} onChange={e => updateField("ruc", e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="razonSocial">Razón Social</Label>
            <Input id="razonSocial" value={formData.razonSocial} onChange={e => updateField("razonSocial", e.target.value)} required />
          </div>
        </div>

        {/* UBICACIÓN */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>País</Label>
            <Select
              value={formData.idPais}
              onValueChange={(v) => v === "ADD_NEW_PAIS" ? setShowModal({ open: true, type: "pais" }) : (setFormData({ ...formData, idPais: v, idCiudad: "" }), cargarCiudades(Number(v)))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="ADD_NEW_PAIS" className="text-blue-600 font-medium"><Plus className="inline h-4 w-4 mr-2" />Nuevo País</SelectItem>
                <SelectSeparator />
                {paisesOrdenados.map(p => <SelectItem key={p.idPais} value={p.idPais.toString()}>{p.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Ciudad</Label>
            <Select
              value={formData.idCiudad}
              disabled={!formData.idPais || loadingLocs}
              onValueChange={(v) => v === "ADD_NEW_CIUDAD" ? setShowModal({ open: true, type: "ciudad" }) : updateField("idCiudad", v)}
            >
              <SelectTrigger>{loadingLocs ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue placeholder="Seleccionar" />}</SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="ADD_NEW_CIUDAD" className="text-blue-600 font-medium"><Plus className="inline h-4 w-4 mr-2" />Nueva Ciudad</SelectItem>
                <SelectSeparator />
                {ciudadesOrdenadas.map(c => <SelectItem key={c.idCiudad} value={c.idCiudad.toString()}>{c.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="calle1">Calle Principal</Label>
            <Input id="calle1" value={formData.calle1} onChange={e => updateField("calle1", e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="calle2">Calle Secundaria / Nro</Label>
            <Input id="calle2" value={formData.calle2} onChange={e => updateField("calle2", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="descripcionDireccion">Referencias de Dirección</Label>
          <Input id="descripcionDireccion" value={formData.descripcionDireccion} onChange={e => updateField("descripcionDireccion", e.target.value)} placeholder="Ej: Portón azul, frente al parque..." />
        </div>

        {/* CATEGORÍAS */}
        <div className="grid gap-3 border-y py-4 my-2 bg-slate-50/50 p-2 rounded-lg">
          <Label className="text-blue-700 font-bold">Categorías de Productos</Label>
          <div className="flex flex-wrap gap-2 min-h-[30px]">
            {selectedCats.map(cat => (
              <Badge key={cat.idCategoria} variant="secondary" className="pl-3 pr-1 py-1 gap-1 border-blue-200">
                {cat.nombre}
                <button type="button" onClick={() => setSelectedCats(selectedCats.filter(c => c.idCategoria !== cat.idCategoria))}>
                  <X className="h-3 w-3 hover:text-destructive" />
                </button>
              </Badge>
            ))}
          </div>
          <Select value={selectCatValue} onValueChange={handleAddCat}>
            <SelectTrigger><SelectValue placeholder="Añadir categorías..." /></SelectTrigger>
            <SelectContent className="max-h-[250px]">
              <SelectItem value="ADD_NEW_CAT" className="text-blue-600 font-medium"><Plus className="inline h-4 w-4 mr-2" />Nueva Categoría</SelectItem>
              <SelectSeparator />
              {categoriasDisponiblesOrdenadas.map(c => (
                <SelectItem key={c.idCategoria} value={c.idCategoria.toString()}>{c.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* CONTACTO */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombres">Nombres del Contacto</Label>
            <Input id="nombres" value={formData.nombres} onChange={e => updateField("nombres", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellidos">Apellidos del Contacto</Label>
            <Input id="apellidos" value={formData.apellidos} onChange={e => updateField("apellidos", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input id="correo" type="email" value={formData.correo} onChange={e => updateField("correo", e.target.value)} placeholder="ejemplo@correo.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono / Celular</Label>
            <Input id="telefono" value={formData.telefono} onChange={e => updateField("telefono", e.target.value)} placeholder="09xx xxx xxx" />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {proveedorEditado ? "Actualizar Proveedor" : "Guardar Proveedor"}
          </Button>
        </div>
      </form>

      {/* MODAL GLOBAL PARA CREACIONES RÁPIDAS */}
      <AlertDialog open={showModal.open} onOpenChange={(o) => !o && setShowModal({ ...showModal, open: o })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Agregar {showModal.type === 'categoria' ? 'Categoría' : showModal.type === 'pais' ? 'País' : 'Ciudad'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ingrese el nombre del nuevo elemento que desea registrar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              autoFocus
              placeholder="Nombre..."
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmarCreacion()}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNuevoNombre("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarCreacion}>Guardar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}