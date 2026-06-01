"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Cliente, Pais, Ciudad } from "@/types/types";
import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { Loader2, Plus, X } from "lucide-react";
import { notify } from "@/lib/notifications";
import { maskCIInput, maskRUCInput } from "@/utils/cedula-format";
import { maskPhoneInput } from "@/utils/phone-format";

interface ClienteFormProps {
  clienteEditado?: Cliente | null;
  paises: Pais[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onRefreshPaises: () => void;
}

export function ClienteForm({
  clienteEditado,
  paises,
  onSubmit,
  onCancel,
  onRefreshPaises,
}: ClienteFormProps) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectCatValue, setSelectCatValue] = useState<string>("");

  const [showModal, setShowModal] = useState<{ open: boolean; type: "pais" | "ciudad" }>({
    open: false,
    type: "pais",
  });
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [formData, setFormData] = useState({
    ci: "",
    ruc: "",
    fechaNacimiento: "",
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

        if (clienteEditado) {
          const idPaisStr = clienteEditado.direccion?.idPais?.toString() || "";
          const idCiudadStr = clienteEditado.direccion?.idCiudad?.toString() || "";

          setFormData({
            ci: clienteEditado.ci || "",
            ruc: clienteEditado.ruc || "",
            fechaNacimiento: clienteEditado.fechaNacimiento || "",
            nombres: clienteEditado.nombres || "",
            apellidos: clienteEditado.apellidos || "",
            telefono: clienteEditado.telefono || "",
            correo: clienteEditado.correo || "",
            idPais: idPaisStr,
            idCiudad: idCiudadStr,
            calle1: clienteEditado.direccion?.calle1 || "",
            calle2: clienteEditado.direccion?.calle2 || "",
            descripcionDireccion: clienteEditado.direccion?.descripcion || "",
          });

          if (idPaisStr) await cargarCiudades(Number(idPaisStr), idCiudadStr);
        }
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [clienteEditado]);

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
    const cleanData = {
      ...formData,
      ci: formData.ci.replace(/\D/g, ""),
      ruc: formData.ruc.replace(/\D/g, ""),
      telefono: formData.telefono.replace(/\D/g, ""),
    };
    
    try {
      await onSubmit(cleanData);
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
          <Label htmlFor="nombres">Nombres</Label>
          <Input
            id="nombres"
            value={formData.nombres}
            onChange={e => updateField("nombres", e.target.value)}
            placeholder="Ej: Juan"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            id="apellidos"
            value={formData.apellidos}
            onChange={e => updateField("apellidos", e.target.value)}
            placeholder="Ej: Pérez"
            required
          />
        </div>
        {/* CI/RUC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ci">CI</Label>
            <Input 
              id="ci" 
              value={formData.ci} 
              onChange={e => {
                const masked = maskCIInput(e.target.value);
                updateField("ci", masked);
              }} 
              placeholder="Ej: 1.123.123"
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input 
              id="ruc" 
              value={formData.ruc} 
              onChange={e => {
                const masked = maskRUCInput(e.target.value);
                updateField("ruc", masked);
              }} 
              placeholder="Ej: 1.123.123-0"
              required 
            />
          </div>
        </div>
        {/* FECHA NACIMIENTO */}
        <div className="grid gap-2">
            <Label htmlFor="ruc">Fecha de Nacimiento</Label>
            <Input id="ruc" type="date" value={formData.fechaNacimiento} onChange={e => updateField("fechaNacimiento", e.target.value)} required />
          </div>
        {/* CONTACTO */}
        <div className="grid grid-cols-2 gap-4">
          {/* CORREO ELECTRÓNICO */}
          <div className="grid gap-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input id="correo" type="email" value={formData.correo} onChange={e => updateField("correo", e.target.value)} placeholder="ejemplo@correo.com" />
          </div>
          {/* TELÉFONO/CELULAR */}
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono / Celular</Label>
            <Input 
              id="telefono" 
              value={formData.telefono} 
              onChange={e => {
                const masked = maskPhoneInput(e.target.value);
                updateField("telefono", masked);
              }} 
              placeholder="09xx-xxx-xxx" 
              maxLength={12}
            />
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
          {/* CIUDAD */}
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
          {/* CALLE PRINCIPAL */}
          <div className="grid gap-2">
            <Label htmlFor="calle1">Calle Principal</Label>
            <Input id="calle1" value={formData.calle1} onChange={e => updateField("calle1", e.target.value)} required  placeholder="Ej: Av. 123"/>
          </div>
          {/* CALLE SECUNDARIA */}
          <div className="grid gap-2">
            <Label htmlFor="calle2">Calle Secundaria / Nro</Label>
            <Input id="calle2" value={formData.calle2} onChange={e => updateField("calle2", e.target.value)} required placeholder="Ej: Barrio ABC"/>
          </div>
        </div>
        {/* REFERENCIAS DE DIRECCIÓN */}
        <div className="grid gap-2">
          <Label htmlFor="descripcionDireccion">Referencias de Dirección</Label>
          <Input id="descripcionDireccion" value={formData.descripcionDireccion} onChange={e => updateField("descripcionDireccion", e.target.value)} placeholder="Ej: Portón azul, frente al parque..." />
        </div>
        {/* ACCIONES */}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {clienteEditado ? "Actualizar Cliente" : "Guardar Cliente"}
          </Button>
        </div>
      </form>
      {/* MODAL GLOBAL PARA CREACIONES RÁPIDAS */}
      <AlertDialog open={showModal.open} onOpenChange={(o) => !o && setShowModal({ ...showModal, open: o })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Agregar {showModal.type === 'pais' ? 'País' : 'Ciudad'}
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