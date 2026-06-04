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
  CuentaBancaria,
  Estado,
  MovimientoBancario,
  MovimientoBancarioSaveDTO,
  TipoMovimientoBancario,
} from "@/types/types";
import { toInputDate } from "@/lib/format-date";
import { formatNumberDots } from "@/utils/money-format";

interface MovimientoBancarioFormProps {
  movimientoEditado?: MovimientoBancario | null;
  cuentas: CuentaBancaria[];
  tiposMovimiento: TipoMovimientoBancario[];
  estados: Estado[];
  onSubmit: (data: MovimientoBancarioSaveDTO) => Promise<void>;
  onCancel: () => void;
}

const ID_ESTADO_PENDIENTE = 1;
const DEFAULT_ID_ESTADO = ID_ESTADO_PENDIENTE.toString();

const parseIdEstado = (value: string) => {
  const idEstado = Number(value);
  return Number.isFinite(idEstado) && idEstado > 0
    ? idEstado
    : ID_ESTADO_PENDIENTE;
};

export function MovimientoBancarioForm({
  movimientoEditado,
  cuentas,
  tiposMovimiento,
  estados,
  onSubmit,
  onCancel,
}: MovimientoBancarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idCuentaBancaria: "",
    idTipoMovimientoBancario: "",
    idEstado: DEFAULT_ID_ESTADO,
    fecha: new Date().toISOString().substring(0, 10),
    monto: 0,
    concepto: "",
    referencia: "",
  });

  useEffect(() => {
    if (movimientoEditado) {
      setFormData({
        idCuentaBancaria: (movimientoEditado.idCuentaBancaria ?? "").toString(),
        idTipoMovimientoBancario:
          (movimientoEditado.idTipoMovimientoBancario ?? "").toString(),
        idEstado: movimientoEditado.idEstado
          ? movimientoEditado.idEstado.toString()
          : DEFAULT_ID_ESTADO,
        fecha: toInputDate(movimientoEditado.fecha),
        monto: movimientoEditado.monto ?? 0,
        concepto: movimientoEditado.concepto ?? "",
        referencia: movimientoEditado.referencia ?? "",
      });
    }
  }, [movimientoEditado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: MovimientoBancarioSaveDTO = {
      idCuentaBancaria: Number(formData.idCuentaBancaria),
      idTipoMovimientoBancario: Number(formData.idTipoMovimientoBancario),
      idEstado: parseIdEstado(formData.idEstado),
      idOrdenMedioPagoCompra: movimientoEditado?.idOrdenMedioPagoCompra ?? null,
      idChequeEmitido: movimientoEditado?.idChequeEmitido ?? null,
      fecha: formData.fecha,
      monto: formData.monto,
      concepto: formData.concepto.trim(),
      referencia: formData.referencia.trim(),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cuentasActivas = cuentas.filter((c) => c.activa);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="grid gap-2">
        <Label>Cuenta bancaria</Label>
        <Select
          value={formData.idCuentaBancaria}
          onValueChange={(v) =>
            setFormData((p) => ({ ...p, idCuentaBancaria: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar cuenta" />
          </SelectTrigger>
          <SelectContent>
            {cuentasActivas.map((c) => (
              <SelectItem
                key={c.idCuentaBancaria}
                value={c.idCuentaBancaria.toString()}
              >
                {c.banco} — {c.numeroCuenta}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Tipo de movimiento</Label>
        <Select
          value={formData.idTipoMovimientoBancario}
          onValueChange={(v) =>
            setFormData((p) => ({ ...p, idTipoMovimientoBancario: v }))
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {tiposMovimiento.map((t) => (
              <SelectItem
                key={t.idTipoMovimientoBancario}
                value={t.idTipoMovimientoBancario.toString()}
              >
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Estado</Label>
        <Select
          value={formData.idEstado}
          onValueChange={(v) => setFormData((p) => ({ ...p, idEstado: v }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((e) => (
              <SelectItem key={e.idEstado} value={e.idEstado.toString()}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData((p) => ({ ...p, fecha: e.target.value }))
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monto">Monto (₲)</Label>
          <Input
            id="monto"
            type="text"
            inputMode="numeric"
            value={formatNumberDots(formData.monto)}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              setFormData((p) => ({
                ...p,
                monto: parseInt(rawValue, 10) || 0,
              }));
            }}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="concepto">Concepto</Label>
        <Input
          id="concepto"
          value={formData.concepto}
          onChange={(e) =>
            setFormData((p) => ({ ...p, concepto: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="referencia">Referencia</Label>
        <Input
          id="referencia"
          value={formData.referencia}
          onChange={(e) =>
            setFormData((p) => ({ ...p, referencia: e.target.value }))
          }
        />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {movimientoEditado ? "Actualizar" : "Registrar movimiento"}
        </Button>
      </div>
    </form>
  );
}
