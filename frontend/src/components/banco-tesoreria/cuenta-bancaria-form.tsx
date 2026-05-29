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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Banco,
  CuentaBancaria,
  CuentaBancariaSaveDTO,
  CuentaContable,
  TipoCuentaBancaria,
} from "@/types/types";

const MONEDAS = [
  { value: "PYG", label: "Guaraníes (PYG)" },
  { value: "USD", label: "Dólares (USD)" },
];

interface CuentaBancariaFormProps {
  cuentaEditada?: CuentaBancaria | null;
  bancos: Banco[];
  tiposCuenta: TipoCuentaBancaria[];
  cuentasContables: CuentaContable[];
  onSubmit: (data: CuentaBancariaSaveDTO) => Promise<void>;
  onCancel: () => void;
}

export function CuentaBancariaForm({
  cuentaEditada,
  bancos,
  tiposCuenta,
  cuentasContables,
  onSubmit,
  onCancel,
}: CuentaBancariaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idBanco: "",
    idTipoCuentaBancaria: "",
    idCuentaContable: "",
    numeroCuenta: "",
    moneda: "PYG",
    activa: true,
  });

  useEffect(() => {
    if (cuentaEditada) {
      setFormData({
        idBanco: cuentaEditada.idBanco.toString(),
        idTipoCuentaBancaria: cuentaEditada.idTipoCuentaBancaria.toString(),
        idCuentaContable: cuentaEditada.idCuentaContable.toString(),
        numeroCuenta: cuentaEditada.numeroCuenta,
        moneda: cuentaEditada.moneda || "PYG",
        activa: cuentaEditada.activa,
      });
    } else {
      setFormData({
        idBanco: "",
        idTipoCuentaBancaria: "",
        idCuentaContable: "",
        numeroCuenta: "",
        moneda: "PYG",
        activa: true,
      });
    }
  }, [cuentaEditada]);

  const bancosActivos = bancos.filter((b) => b.activo);
  const cuentasAsentables = cuentasContables.filter((c) => c.activa);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CuentaBancariaSaveDTO = {
      idBanco: Number(formData.idBanco),
      idTipoCuentaBancaria: Number(formData.idTipoCuentaBancaria),
      idCuentaContable: Number(formData.idCuentaContable),
      numeroCuenta: formData.numeroCuenta.trim(),
      moneda: formData.moneda,
      activa: formData.activa,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="grid gap-2">
        <Label>Banco</Label>
        <Select
          value={formData.idBanco}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, idBanco: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar banco" />
          </SelectTrigger>
          <SelectContent>
            {bancosActivos.map((b) => (
              <SelectItem key={b.idBanco} value={b.idBanco.toString()}>
                {b.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Tipo de cuenta</Label>
        <Select
          value={formData.idTipoCuentaBancaria}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, idTipoCuentaBancaria: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Corriente o ahorro" />
          </SelectTrigger>
          <SelectContent>
            {tiposCuenta.map((t) => (
              <SelectItem
                key={t.idTipoCuentaBancaria}
                value={t.idTipoCuentaBancaria.toString()}
              >
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Cuenta contable asociada</Label>
        <Select
          value={formData.idCuentaContable}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, idCuentaContable: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Cuenta del plan contable" />
          </SelectTrigger>
          <SelectContent>
            {cuentasAsentables.map((c) => (
              <SelectItem
                key={c.idCuentaContable}
                value={c.idCuentaContable.toString()}
              >
                {c.numeroCuenta} — {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="numeroCuenta">Número de cuenta</Label>
        <Input
          id="numeroCuenta"
          value={formData.numeroCuenta}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, numeroCuenta: e.target.value }))
          }
          placeholder="Ej. 001-123456-78"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Moneda</Label>
        <Select
          value={formData.moneda}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, moneda: v }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONEDAS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={formData.activa}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, activa: e.target.checked }))
          }
          className="size-4 rounded border-input"
        />
        Cuenta activa
      </label>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {cuentaEditada ? "Actualizar cuenta" : "Registrar cuenta"}
        </Button>
      </div>
    </form>
  );
}
