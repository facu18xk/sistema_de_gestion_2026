"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
  Empleado,
  Pariente,
  ParienteFormState,
  ParienteSaveDTO,
} from "@/types/types";
import { EmpleadoSelector } from "@/components/personas/empleado-selector";

import { notify } from "@/lib/notifications";

interface ParienteFormProps {
  parienteEditado?: Pariente | null;
  empleados: Empleado[];

  onSubmit: (data: ParienteSaveDTO) => void;
  onCancel: () => void;
}

export function ParienteForm({
  parienteEditado,
  empleados,
  onSubmit,
  onCancel,
}: ParienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [formData, setFormData] = useState<ParienteFormState>({
    idEmpleado: "",
    tipoRelacion: "",
    edad: "",
    fechaNacimiento: "",
  });

  const empleadosOrdenados = [...empleados].sort((a, b) =>
    `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`),
  );

  const calcularEdad = (fechaNacimiento: string): string => {
    if (!fechaNacimiento) return "";

    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();

    if (
      mesActual < mesNacimiento ||
      (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
    ) {
      edad--;
    }

    return edad.toString();
  };

  const updateField = (id: keyof ParienteFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  useEffect(() => {
    if (parienteEditado) {
      setFormData({
        idEmpleado: parienteEditado.idEmpleado.toString(),
        tipoRelacion: parienteEditado.tipoRelacion,
        edad: parienteEditado.edad.toString(),
        fechaNacimiento: parienteEditado.fechaNacimiento.substring(0, 10),
      });
    } else {
      setFormData({
        idEmpleado: "",
        tipoRelacion: "",
        edad: "",
        fechaNacimiento: "",
      });
    }
  }, [parienteEditado]);

  const confirmarSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit({
        idEmpleado: Number(formData.idEmpleado),
        tipoRelacion: formData.tipoRelacion,
        edad: Number(formData.edad),
        fechaNacimiento: formData.fechaNacimiento,
      });
    } catch (error) {
      setIsSubmitting(false);
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 py-4 text-sm overflow-y-auto max-h-[85vh] px-2"
      >
        <div className="grid gap-2">
          <Label>Empleado</Label>

          <EmpleadoSelector
            empleados={empleadosOrdenados}
            selectedEmpleadoId={Number(formData.idEmpleado)}
            onSelect={(empleado) =>
              updateField("idEmpleado", empleado?.idEmpleado.toString() || "")
            }
          />
        </div>

        <div className="grid gap-2">
          <Label>Tipo de Relación</Label>

          <Select
            value={formData.tipoRelacion}
            onValueChange={(v) => updateField("tipoRelacion", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar relación" />
            </SelectTrigger>

            <SelectContent className="max-h-[300px]">
              <SelectItem value="Hijo/a">Hijo/a</SelectItem>

              <SelectItem value="Esposo/a">Esposo/a</SelectItem>

              <SelectItem value="Padre">Padre</SelectItem>

              <SelectItem value="Madre">Madre</SelectItem>

              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edad">Edad</Label>

            <Input id="edad" type="number" value={formData.edad} disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>

            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => {
                const fecha = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  fechaNacimiento: fecha,
                  edad: calcularEdad(fecha),
                }));
              }}
              required
            />
          </div>
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

            {parienteEditado ? "Actualizar Pariente" : "Guardar Pariente"}
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {parienteEditado ? "Actualizar Pariente" : "Registrar Pariente"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {parienteEditado
                ? "¿Desea guardar los cambios realizados?"
                : "¿Desea registrar este nuevo pariente?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmarSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
