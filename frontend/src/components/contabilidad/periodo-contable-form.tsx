"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

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
  PeriodoContableSaveDTO,
  ProcesoContableDTO,
} from "@/types/types";

interface Props {
  procesos: ProcesoContableDTO[];
  onSubmit: (data: PeriodoContableSaveDTO) => Promise<void>;
  onCancel: () => void;
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthRange(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  return {
    fechaInicio: formatDateInput(firstDay),
    fechaFin: formatDateInput(lastDay),
  };
}

export function PeriodoContableForm({ procesos, onSubmit, onCancel }: Props) {
  const procesoInicial = useMemo(
    () =>
      procesos.find((proceso) => proceso.estado === "Habilitado") ??
      procesos[0] ??
      null,
    [procesos],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<PeriodoContableSaveDTO>(() => {
    const currentDate = new Date();
    const anho = procesoInicial?.periodoAnho ?? currentDate.getFullYear();
    const mes = currentDate.getMonth() + 1;
    const range = getMonthRange(anho, mes);

    return {
      idProcesoContable: procesoInicial?.idProcesoContable ?? 0,
      anho,
      mes,
      fechaInicio: range.fechaInicio,
      fechaFin: range.fechaFin,
      estado: "Habilitado",
    };
  });

  useEffect(() => {
    if (!procesoInicial) return;

    setFormData((prev) => {
      const range = getMonthRange(procesoInicial.periodoAnho, prev.mes);

      return {
        ...prev,
        idProcesoContable: procesoInicial.idProcesoContable,
        anho: procesoInicial.periodoAnho,
        fechaInicio: range.fechaInicio,
        fechaFin: range.fechaFin,
      };
    });
  }, [procesoInicial]);

  const updatePeriodoRange = (anho: number, mes: number) => {
    const range = getMonthRange(anho, mes);

    setFormData((prev) => ({
      ...prev,
      anho,
      mes,
      fechaInicio: range.fechaInicio,
      fechaFin: range.fechaFin,
    }));
  };

  const handleProcesoChange = (id: string) => {
    const proceso = procesos.find(
      (item) => item.idProcesoContable === Number(id),
    );
    if (!proceso) return;

    const range = getMonthRange(proceso.periodoAnho, formData.mes);

    setFormData((prev) => ({
      ...prev,
      idProcesoContable: proceso.idProcesoContable,
      anho: proceso.periodoAnho,
      fechaInicio: range.fechaInicio,
      fechaFin: range.fechaFin,
    }));
  };

  const confirmarSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowConfirmDialog(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 py-4 text-sm overflow-y-auto max-h-[85vh] px-2"
      >
        <div className="grid gap-2">
          <Label htmlFor="idProcesoContable">Proceso contable</Label>
          <Select
            value={
              formData.idProcesoContable
                ? String(formData.idProcesoContable)
                : undefined
            }
            onValueChange={handleProcesoChange}
            disabled={procesos.length === 0}
          >
            <SelectTrigger id="idProcesoContable">
              <SelectValue placeholder="Seleccionar proceso contable" />
            </SelectTrigger>
            <SelectContent>
              {procesos.map((proceso) => (
                <SelectItem
                  key={proceso.idProcesoContable}
                  value={String(proceso.idProcesoContable)}
                >
                  {proceso.descripcion || `Proceso ${proceso.periodoAnho}`} -{" "}
                  {proceso.periodoAnho}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mes">Mes</Label>
            <Select
              value={String(formData.mes)}
              onValueChange={(value) =>
                updatePeriodoRange(formData.anho, Number(value))
              }
            >
              <SelectTrigger id="mes">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes, index) => (
                  <SelectItem key={mes} value={String(index + 1)}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, estado: value }))
              }
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Habilitado">Habilitado</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fechaInicio">Fecha inicio</Label>
            <Input
              id="fechaInicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  fechaInicio: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fechaFin">Fecha fin</Label>
            <Input
              id="fechaFin"
              type="date"
              value={formData.fechaFin}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  fechaFin: event.target.value,
                }))
              }
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
            disabled={isSubmitting || procesos.length === 0}
            className="cursor-pointer"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Período Contable
          </Button>
        </div>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Período Contable</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea registrar este período contable?
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
