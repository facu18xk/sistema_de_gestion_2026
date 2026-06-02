"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CuentaBancariaSelector } from "@/components/banco-tesoreria/cuenta-bancaria-selector";
import { chequesEmitidosAPI } from "@/services/chequesEmitidosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { formatMoney } from "@/lib/format-currency";
import { notify } from "@/lib/notifications";
import { formatNumberDots } from "@/utils/money-format";
import type { ChequeEmitidoSaveDTO, CuentaBancaria } from "@/types/types";

function toLocalIsoDate(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function getErrorMessage(error: any) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof error?.message === "string") return error.message;
  return "No se pudo registrar el cheque.";
}

export default function EmitirChequePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [cuentaSel, setCuentaSel] = useState<CuentaBancaria | null>(null);

  const [numeroCheque, setNumeroCheque] = useState("");
  const [beneficiario, setBeneficiario] = useState("");
  const [fechaEmision, setFechaEmision] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [monto, setMonto] = useState<number>(0);

  useEffect(() => {
    cuentasBancariasAPI
      .getAll(1, 200)
      .then((res) => setCuentas(res.items))
      .catch(() =>
        notify.error("Error", "No se pudieron cargar las cuentas bancarias."),
      );
  }, []);

  const handleGuardar = async () => {
    if (!cuentaSel) {
      notify.error("Datos incompletos", "Seleccione la cuenta bancaria.");
      return;
    }
    if (!numeroCheque.trim() || !beneficiario.trim() || monto <= 0) {
      notify.error(
        "Datos incompletos",
        "Complete número, beneficiario y monto del cheque.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ChequeEmitidoSaveDTO = {
        idCuentaBancaria: cuentaSel.idCuentaBancaria,
        idOrdenMedioPagoCompra: null,
        idMovimientoBancario: null,
        numeroCheque: numeroCheque.trim(),
        beneficiario: beneficiario.trim(),
        fechaEmision: toLocalIsoDate(fechaEmision),
        monto,
        estado: "Emitido",
      };

      await chequesEmitidosAPI.create(payload);
      notify.success(
        "Cheque emitido",
        "El cheque fue registrado correctamente.",
      );
      router.push("/banco-tesoreria/cheques");
      router.refresh();
    } catch (error: any) {
      console.error("Error al emitir cheque:", error);
      notify.error("Error", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Cheques", href: "/banco-tesoreria/cheques" },
          { label: "Emitir cheque" },
        ]}
      />

      <h1 className="text-xl font-bold tracking-tight">Emitir cheque</h1>

      <div className="flex justify-between items-start gap-4 my-2">
        <div className="w-full max-w-md">
          <CuentaBancariaSelector
            cuentas={cuentas}
            selectedId={cuentaSel?.idCuentaBancaria}
            onSelect={setCuentaSel}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            className="h-8 cursor-pointer"
            onClick={() => router.push("/banco-tesoreria/cheques")}
          >
            Cancelar
          </Button>
          <Button
            className="h-8 cursor-pointer"
            onClick={handleGuardar}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Emitir cheque"}
          </Button>
        </div>
      </div>

      <div className="p-3 border rounded-lg bg-slate-50/40 text-xs shadow-sm">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Datos del cheque
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="numeroCheque" className="text-[13px]">
              Nº de cheque
            </Label>
            <Input
              id="numeroCheque"
              value={numeroCheque}
              onChange={(e) => setNumeroCheque(e.target.value)}
              placeholder="0000001"
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="beneficiario" className="text-[13px]">
              Beneficiario
            </Label>
            <Input
              id="beneficiario"
              value={beneficiario}
              onChange={(e) => setBeneficiario(e.target.value)}
              placeholder="Nombre o razón social"
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fechaEmision" className="text-[13px]">
              Fecha emisión
            </Label>
            <Input
              id="fechaEmision"
              type="date"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
              className="h-9"
            />
          </div>
          {/*<div className="grid gap-1.5">
            <Label htmlFor="fechaPago" className="text-[13px]">
              Fecha pago (opcional)
            </Label>
            <Input
              id="fechaPago"
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="h-9"
            />
          </div>*/}
        </div>
      </div>

      {cuentaSel && (
        <div className="p-3 border rounded-lg bg-white shadow-sm mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground text-[13px]">Banco</p>
              <p className="font-semibold">{cuentaSel.banco}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[13px]">Cuenta</p>
              <p className="font-semibold">{cuentaSel.numeroCuenta}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[13px]">
                Saldo disponible
              </p>
              <p className="font-semibold">
                {formatMoney(cuentaSel.saldoDisponible, cuentaSel.moneda)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-[13px]">Moneda</p>
              <p className="font-semibold">{cuentaSel.moneda}</p>
            </div>
          </div>

          <div className="grid gap-1.5 max-w-xs">
            <Label htmlFor="monto" className="text-[13px]">
              Monto del cheque (₲)
            </Label>
            <Input
              id="monto"
              type="text"
              inputMode="numeric"
              value={formatNumberDots(monto)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setMonto(parseInt(rawValue, 10) || 0);
              }}
              className="h-10 text-lg font-semibold"
            />
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t">
            <p className="text-2xl font-black text-primary">
              Total: {formatMoney(monto, cuentaSel.moneda)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
