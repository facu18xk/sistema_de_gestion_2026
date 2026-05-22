"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcesoContableDTO, ProcesoContableSaveDTO } from "@/types/types";

interface Props {
  procesoEditado?: ProcesoContableDTO | null;
  onSubmit: (data: ProcesoContableSaveDTO) => Promise<void>;
  onCancel: () => void;
}

export function ProcesoContableForm({
  procesoEditado,
  onSubmit,
  onCancel,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<ProcesoContableSaveDTO>({
    periodoAnho: new Date().getFullYear(),
    descripcion: "",
    cantNiveles: 1,
    cantDigitosNivel: 1,
    moneda: "Gs",
  });

  useEffect(() => {
    if (procesoEditado) {
      setFormData({
        periodoAnho: procesoEditado.periodoAnho,
        descripcion: procesoEditado.descripcion,
        cantNiveles: procesoEditado.cantNiveles,
        cantDigitosNivel: procesoEditado.cantDigitosNivel,
        moneda: procesoEditado.moneda,
      });
    } else {
      setFormData({
        periodoAnho: new Date().getFullYear(),
        descripcion: "",
        cantNiveles: 1,
        cantDigitosNivel: 1,
        moneda: "Gs",
      });
    }
  }, [procesoEditado]);

  const updateField = (
    field: keyof ProcesoContableSaveDTO,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmarSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit({
        periodoAnho: formData.periodoAnho,
        descripcion: formData.descripcion,
        cantNiveles: formData.cantNiveles,
        cantDigitosNivel: formData.cantDigitosNivel,
        moneda: formData.moneda,
      });
    } catch (error) {
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
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
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="periodoAnho">Periodo Año</Label>
            <Input
              id="periodoAnho"
              type="number"
              min={2000}
              value={formData.periodoAnho}
              onChange={(e) =>
                updateField("periodoAnho", Number(e.target.value))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="moneda">Moneda</Label>
            <Select
              value={formData.moneda}
              onValueChange={(v) => updateField("moneda", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Gs">Guaraníes (Gs)</SelectItem>

                <SelectItem value="USD">Dólares (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cantNiveles"> Cantidad de niveles</Label>
            <Input
              id="cantNiveles"
              type="number"
              min={1}
              max={10}
              value={formData.cantNiveles}
              onChange={(e) =>
                updateField("cantNiveles", Number(e.target.value))
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cantDigitosNivel">Digitos/Nivel</Label>
            <Input
              id="cantDigitosNivel"
              type="number"
              min={1}
              max={6}
              value={formData.cantDigitosNivel}
              onChange={(e) =>
                updateField("cantDigitosNivel", Number(e.target.value))
              }
              required
            />
          </div>
        </div>

        <Label htmlFor="descripcion">Descripcion</Label>
        <Input
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => updateField("descripcion", e.target.value)}
          required
        />

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
            {procesoEditado
              ? "Actualizar Proceso Contable"
              : "Guardar Proceso Contable"}
          </Button>
        </div>
      </form>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {procesoEditado
                ? "Actualizar Proceso Contable"
                : "Registrar Proceso Contable"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {procesoEditado
                ? "¿Desea guardar los cambios realizados?"
                : "¿Desea registrar este nuevo proceso contable?"}
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
