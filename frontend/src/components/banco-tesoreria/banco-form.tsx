"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Banco, BancoSaveDTO } from "@/types/types";

interface BancoFormProps {
  bancoEditado?: Banco | null;
  onSubmit: (data: BancoSaveDTO) => Promise<void>;
  onCancel: () => void;
}

export function BancoForm({
  bancoEditado,
  onSubmit,
  onCancel,
}: BancoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BancoSaveDTO>({
    nombre: "",
    activo: true,
  });

  useEffect(() => {
    if (bancoEditado) {
      setFormData({
        nombre: bancoEditado.nombre,
        activo: bancoEditado.activo,
      });
    } else {
      setFormData({ nombre: "", activo: true });
    }
  }, [bancoEditado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        nombre: formData.nombre.trim(),
        activo: formData.activo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre del banco</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder="Ej. Banco Nacional de Fomento"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={formData.activo}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, activo: e.target.checked }))
          }
          className="size-4 rounded border-input"
        />
        Banco activo en el sistema
      </label>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {bancoEditado ? "Actualizar" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
