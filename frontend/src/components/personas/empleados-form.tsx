"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
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
} from "@/components/ui/alert-dialog";

import {
  Ciudad,
  Empleado,
  EmpleadoFormState,
  EmpleadoSaveDTO,
  Pais,
} from "@/types/types";

import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { notify } from "@/lib/notifications";

interface EmpleadoFormProps {
  empleadoEditado?: Empleado | null;
  paises: Pais[];
  onSubmit: (data: EmpleadoSaveDTO) => void;
  onCancel: () => void;
  onRefreshPaises: () => Promise<void>;
}

export function EmpleadoForm({
  empleadoEditado,
  paises,
  onSubmit,
  onCancel,
  onRefreshPaises,
}: EmpleadoFormProps) {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [showModal, setShowModal] = useState<{
    open: boolean;
    type: "pais" | "ciudad";
  }>({
    open: false,
    type: "pais",
  });

  const [nuevoNombre, setNuevoNombre] = useState("");

  const [formData, setFormData] = useState<EmpleadoFormState>({
    ci: "",
    ruc: "",
    fechaIngreso: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    idPais: "",
    idCiudad: "",
    calle1: "",
    calle2: "",
    descripcionDireccion: "",
  });

  const paisesOrdenados = useMemo(() => {
    return [...paises].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [paises]);

  const ciudadesOrdenadas = useMemo(() => {
    return [...ciudades].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [ciudades]);

  const updateField = (id: keyof EmpleadoFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const cargarCiudades = async (
    idPais: number,
    idCiudadASeleccionar?: string,
  ) => {
    if (!idPais) return;

    setLoadingLocs(true);

    try {
      const data = await ubicacionesAPI.getCiudadesPorPais(idPais);
      setCiudades(data.items ?? data);

      if (idCiudadASeleccionar) {
        updateField("idCiudad", idCiudadASeleccionar);
      }
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
      notify.warning("Error", "No se pudieron cargar las ciudades.");
    } finally {
      setLoadingLocs(false);
    }
  };

  useEffect(() => {
    if (empleadoEditado) {
      const idPaisStr = empleadoEditado.direccion?.idPais?.toString() || "";
      const idCiudadStr = empleadoEditado.direccion?.idCiudad?.toString() || "";

      setFormData({
        ci: empleadoEditado.ci || "",
        ruc: empleadoEditado.ruc || "",
        fechaIngreso: empleadoEditado.fechaIngreso?.substring(0, 10) || "",
        nombres: empleadoEditado.nombres || "",
        apellidos: empleadoEditado.apellidos || "",
        correo: empleadoEditado.correo || "",
        telefono: empleadoEditado.telefono || "",
        idPais: idPaisStr,
        idCiudad: idCiudadStr,
        calle1: empleadoEditado.direccion?.calle1 || "",
        calle2: empleadoEditado.direccion?.calle2 || "",
        descripcionDireccion: empleadoEditado.direccion?.descripcion || "",
      });

      if (idPaisStr) {
        cargarCiudades(Number(idPaisStr), idCiudadStr);
      }
    } else {
      setFormData({
        ci: "",
        ruc: "",
        fechaIngreso: "",
        nombres: "",
        apellidos: "",
        correo: "",
        telefono: "",
        idPais: "",
        idCiudad: "",
        calle1: "",
        calle2: "",
        descripcionDireccion: "",
      });

      setCiudades([]);
    }
  }, [empleadoEditado]);

  const handleConfirmarCreacion = async () => {
    if (!nuevoNombre.trim()) return;

    try {
      if (showModal.type === "pais") {
        const nuevoPais = await ubicacionesAPI.createPais({
          nombre: nuevoNombre.trim(),
        });

        await onRefreshPaises();

        setFormData((prev) => ({
          ...prev,
          idPais: nuevoPais.idPais.toString(),
          idCiudad: "",
        }));

        setCiudades([]);
        setResetKey((prev) => prev + 1);
      }

      if (showModal.type === "ciudad") {
        if (!formData.idPais) {
          notify.error("Error", "Primero seleccione un país.");
          return;
        }

        const nuevaCiudad = await ubicacionesAPI.createCiudad({
          nombre: nuevoNombre.trim(),
          idPais: Number(formData.idPais),
        });

        await cargarCiudades(
          Number(formData.idPais),
          nuevaCiudad.idCiudad.toString(),
        );
        setFormData((prev) => ({
          ...prev,
          idCiudad: nuevaCiudad.idCiudad.toString(),
        }));

        setResetKey((prev) => prev + 1);
      }

      notify.success("Éxito", "Guardado correctamente.");
    } catch (error) {
      console.error("Error al crear ubicación:", error);
      notify.error("Error", "No se pudo realizar la creación.");
    } finally {
      setNuevoNombre("");
      setShowModal({ ...showModal, open: false });
    }
  };

  const cerrarDialogo = () => {
    setNuevoNombre("");
    setShowModal({ ...showModal, open: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ci: formData.ci,
        ruc: formData.ruc,
        fechaIngreso: formData.fechaIngreso,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: {
          calle1: formData.calle1,
          calle2: formData.calle2 || null,
          descripcion: formData.descripcionDireccion || null,
          idPais: Number.parseInt(formData.idPais, 10),
          idCiudad: Number.parseInt(formData.idCiudad, 10),
        },
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 py-4 text-sm overflow-y-auto max-h-[85vh] px-2"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombres">Nombres</Label>
            <Input
              id="nombres"
              value={formData.nombres}
              onChange={(e) => updateField("nombres", e.target.value)}
              placeholder="Ej: Juan"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apellidos">Apellidos</Label>
            <Input
              id="apellidos"
              value={formData.apellidos}
              onChange={(e) => updateField("apellidos", e.target.value)}
              placeholder="Ej: González"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ci">CI</Label>
            <Input
              id="ci"
              value={formData.ci}
              onChange={(e) => updateField("ci", e.target.value)}
              placeholder="Ej: 5555555"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input
              id="ruc"
              value={formData.ruc}
              onChange={(e) => updateField("ruc", e.target.value)}
              placeholder="Ej: 5555555-6"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => updateField("correo", e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono / Celular</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              placeholder="09xx xxx xxx"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
          <Input
            id="fechaIngreso"
            type="date"
            value={formData.fechaIngreso}
            onChange={(e) => updateField("fechaIngreso", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>País</Label>
            <Select
              key={`pais-${formData.idPais}-${paises.length}-${resetKey}`}
              value={formData.idPais}
              onValueChange={(v) =>
                v === "ADD_NEW_PAIS"
                  ? setShowModal({ open: true, type: "pais" })
                  : (setFormData({
                      ...formData,
                      idPais: v,
                      idCiudad: "",
                    }),
                    cargarCiudades(Number(v)))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>

              <SelectContent className="max-h-[300px]">
                <SelectItem
                  value="ADD_NEW_PAIS"
                  className="text-blue-600 font-medium"
                >
                  <Plus className="inline h-4 w-4 mr-2" />
                  Nuevo País
                </SelectItem>

                <SelectSeparator />

                {paisesOrdenados.map((pais) => (
                  <SelectItem key={pais.idPais} value={pais.idPais.toString()}>
                    {pais.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Ciudad</Label>
            <Select
              key={`ciudad-${formData.idCiudad}-${ciudades.length}-${resetKey}`}
              value={formData.idCiudad}
              disabled={!formData.idPais || loadingLocs}
              onValueChange={(v) =>
                v === "ADD_NEW_CIUDAD"
                  ? setShowModal({ open: true, type: "ciudad" })
                  : updateField("idCiudad", v)
              }
            >
              <SelectTrigger>
                {loadingLocs ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SelectValue placeholder="Seleccionar" />
                )}
              </SelectTrigger>

              <SelectContent className="max-h-[300px]">
                <SelectItem
                  value="ADD_NEW_CIUDAD"
                  className="text-blue-600 font-medium"
                >
                  <Plus className="inline h-4 w-4 mr-2" />
                  Nueva Ciudad
                </SelectItem>

                <SelectSeparator />

                {ciudadesOrdenadas.map((ciudad) => (
                  <SelectItem
                    key={ciudad.idCiudad}
                    value={ciudad.idCiudad.toString()}
                  >
                    {ciudad.nombre}
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

        <div className="grid gap-2">
          <Label htmlFor="descripcionDireccion">Referencias de Dirección</Label>
          <Input
            id="descripcionDireccion"
            value={formData.descripcionDireccion}
            onChange={(e) =>
              updateField("descripcionDireccion", e.target.value)
            }
            placeholder="Ej: Portón azul, frente al parque..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {empleadoEditado ? "Actualizar Empleado" : "Guardar Empleado"}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={showModal.open}
        onOpenChange={(open) => !open && cerrarDialogo()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Agregar {showModal.type === "pais" ? "País" : "Ciudad"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              Ingrese el nombre del nuevo elemento que desea registrar.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Input
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              autoFocus
              placeholder="Nombre..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmarCreacion();
              }}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={cerrarDialogo}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirmarCreacion}>
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
