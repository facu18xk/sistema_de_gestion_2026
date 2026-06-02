"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChequeEmitido } from "@/types/types";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

function todayInputDate() {
  return new Date().toISOString().substring(0, 10);
}

function toLocalIsoDate(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

interface ConciliarChequeFormProps {
  cheque: ChequeEmitido;
  moneda?: string;
  onSubmit: (fechaPago: string) => Promise<void>;
  onCancel: () => void;
}

export function ConciliarChequeForm({
  cheque,
  moneda = "PYG",
  onSubmit,
  onCancel,
}: ConciliarChequeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fechaPago, setFechaPago] = useState(todayInputDate());

  useEffect(() => {
    setFechaPago(todayInputDate());
  }, [cheque]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(toLocalIsoDate(fechaPago));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
      <div className="rounded-lg bg-slate-50 p-4 text-sm ring-1 ring-slate-100 space-y-1">
        <p>
          <span className="text-muted-foreground">Nº:</span>{" "}
          <strong>{cheque.numeroCheque}</strong>
        </p>
        <p>
          <span className="text-muted-foreground">Beneficiario:</span>{" "}
          {cheque.beneficiario}
        </p>
        <p>
          <span className="text-muted-foreground">Monto:</span>{" "}
          {formatMoney(cheque.monto, moneda)}
        </p>
        <p>
          <span className="text-muted-foreground">Emisión:</span>{" "}
          {formatDate(cheque.fechaEmision)}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="fechaPago">Fecha de pago</Label>
        <Input
          id="fechaPago"
          type="date"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Conciliar
        </Button>
      </div>
    </form>
  );
}
