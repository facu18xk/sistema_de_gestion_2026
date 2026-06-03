"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { CuentaBancariaSelector } from "@/components/banco-tesoreria/cuenta-bancaria-selector";
import { BancoSelector } from "@/components/banco-tesoreria/banco-selector";
import { ClienteSelector } from "@/components/ventas/ClienteSelector";
import { depositosBancariosAPI } from "@/services/depositosBancariosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { tiposDepositosBancariosAPI } from "@/services/tiposDepositosBancariosAPI";
import { bancosAPI } from "@/services/bancosAPI";
import { clientesAPI } from "@/services/clientesAPI";
import { formatMoney } from "@/lib/format-currency";
import { modoTipoDeposito, nombreCliente } from "@/lib/deposito-tipo";
import { notify } from "@/lib/notifications";
import { formatNumberDots } from "@/utils/money-format";
<<<<<<< HEAD
=======
import { chequesTercerosAPI } from "@/services/chequesTercerosAPI";
import { chequesMismoBancoAPI } from "@/services/chequesMismoBancoAPI";
>>>>>>> front
import type {
  Banco,
  ChequeMismoBancoLineSave,
  ChequeTerceroLineSave,
  Cliente,
  CuentaBancaria,
  TipoDepositoBancario,
} from "@/types/types";

type LineaTerceroUI = ChequeTerceroLineSave & {
  idBanco?: number;
  idCliente?: number;
};

type LineaMismoBancoUI = ChequeMismoBancoLineSave & {
  idCliente?: number;
};

const lineaTerceroVacia = (): LineaTerceroUI => ({
  bancoEmisor: "",
  numeroCheque: "",
  librador: "",
  fechaEmision: new Date().toISOString().split("T")[0],
  monto: 0,
});

const lineaMismoBancoVacia = (): LineaMismoBancoUI => ({
  numeroCheque: "",
  librador: "",
  fechaEmision: new Date().toISOString().split("T")[0],
  monto: 0,
});

export default function NuevoDepositoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tiposDeposito, setTiposDeposito] = useState<TipoDepositoBancario[]>(
    [],
  );
  const [cuentaSel, setCuentaSel] = useState<CuentaBancaria | null>(null);
  const [idTipoDeposito, setIdTipoDeposito] = useState<string>("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [concepto, setConcepto] = useState("");
  const [chequesTercero, setChequesTercero] = useState<LineaTerceroUI[]>([]);
  const [chequesMismoBanco, setChequesMismoBanco] = useState<
    LineaMismoBancoUI[]
  >([]);
  const [efectivoCliente, setEfectivoCliente] = useState<Cliente | null>(null);
  const [efectivoMonto, setEfectivoMonto] = useState(0);

  const tipoSel = tiposDeposito.find(
    (t) => t.idTipoDepositoBancario === Number(idTipoDeposito),
  );
  const modo = modoTipoDeposito(tipoSel);

  useEffect(() => {
    Promise.all([
      cuentasBancariasAPI.getAll(1, 200),
      tiposDepositosBancariosAPI.getAll(1, 50),
      bancosAPI.getAll(1, 200),
      clientesAPI.getAll(1, 300),
    ])
      .then(([resCuentas, resTipos, resBancos, resClientes]) => {
        setCuentas(resCuentas.items);
        setTiposDeposito(resTipos.items);
        setBancos(resBancos.items);
        const ordenados = [...resClientes.items].sort((a, b) =>
          a.nombres.localeCompare(b.nombres, "es-PY"),
        );
        setClientes(ordenados);
        if (resTipos.items.length > 0) {
          setIdTipoDeposito(String(resTipos.items[0].idTipoDepositoBancario));
        }
      })
      .catch(() =>
        notify.error("Error", "No se pudieron cargar los catálogos."),
      );
  }, []);

  const handleTipoChange = (value: string) => {
    setIdTipoDeposito(value);
    setChequesTercero([]);
    setChequesMismoBanco([]);
    setEfectivoCliente(null);
    setEfectivoMonto(0);
  };

  const totalDeposito = useMemo(() => {
    if (modo === "efectivo") return efectivoMonto;
    if (modo === "tercero") {
      return chequesTercero.reduce((acc, c) => acc + (c.monto || 0), 0);
    }
    if (modo === "mismo_banco") {
      return chequesMismoBanco.reduce((acc, c) => acc + (c.monto || 0), 0);
    }
    return 0;
  }, [modo, efectivoMonto, chequesTercero, chequesMismoBanco]);

  const handleGuardar = async () => {
    if (!cuentaSel || !idTipoDeposito) {
      notify.error(
        "Datos incompletos",
        "Seleccione cuenta y tipo de depósito.",
      );
      return;
    }

    if (modo === "efectivo") {
      if (!efectivoCliente || efectivoMonto <= 0) {
        notify.error(
          "Datos incompletos",
          "Seleccione el cliente e ingrese el monto en efectivo.",
        );
        return;
      }
    } else if (modo === "tercero") {
      const validos = chequesTercero.filter(
        (c) => c.monto > 0 && c.idBanco && c.idCliente && c.numeroCheque.trim(),
      );
      if (validos.length === 0) {
        notify.error(
          "Datos incompletos",
          "Agregue al menos un cheque con banco, librador, número y monto.",
        );
        return;
      }
    } else if (modo === "mismo_banco") {
      const validos = chequesMismoBanco.filter(
        (c) => c.monto > 0 && c.idCliente && c.numeroCheque.trim(),
      );
      if (validos.length === 0) {
        notify.error(
          "Datos incompletos",
          "Agregue al menos un cheque con librador, número y monto.",
        );
        return;
      }
    } else {
      notify.error(
        "Tipo no válido",
        "Seleccione un tipo de depósito reconocido.",
      );
      return;
    }

    if (totalDeposito <= 0) {
      notify.error(
        "Sin montos",
        "El monto del depósito debe ser mayor a cero.",
      );
      return;
    }

    const conceptoFinal =
      concepto.trim() ||
      (modo === "efectivo" && efectivoCliente
        ? `Depósito en efectivo — ${nombreCliente(efectivoCliente.nombres, efectivoCliente.apellidos)}`
        : "Depósito bancario");

    setIsSubmitting(true);
    try {
<<<<<<< HEAD
      await depositosBancariosAPI.create({
        idCuentaBancaria: cuentaSel.idCuentaBancaria,
        idTipoDepositoBancario: Number(idTipoDeposito),
        fecha: new Date(fecha).toISOString(),
        monto: totalDeposito,
        concepto: conceptoFinal,
        chequesTercero:
=======
      // 1. CREAR DEPÓSITO (CABECERA)
      const deposito = await depositosBancariosAPI.create({
        idCuentaBancaria: cuentaSel.idCuentaBancaria,
        idTipoDepositoBancario: Number(idTipoDeposito),
        fecha: new Date(fecha).toISOString().split("T")[0],
        monto: totalDeposito,
        concepto: conceptoFinal,
      });
      // 2. OBTENER ID REAL GENERADO
      const idDeposito = deposito.idDepositoBancario;

      // 3. CHEQUES DE TERCEROS
      if (modo === "tercero") {
        const chequesValidos = chequesTercero.filter(
          (c) => c.monto > 0 && c.numeroCheque.trim(),
        );

        for (const cheque of chequesValidos) {
          await chequesTercerosAPI.create({
            idDepositoBancario: idDeposito,
            bancoEmisor: cheque.bancoEmisor,
            numeroCheque: cheque.numeroCheque,
            librador: cheque.librador,
            fechaEmision: cheque.fechaEmision,
            monto: cheque.monto,
            estado: "Pendiente",
          });
        }
      }

      // 4. CHEQUES MISMO BANCO
      if (modo === "mismo_banco") {
        const chequesValidos = chequesMismoBanco.filter(
          (c) => c.monto > 0 && c.numeroCheque.trim(),
        );

        for (const cheque of chequesValidos) {
          await chequesMismoBancoAPI.create({
            idDepositoBancario: idDeposito,
            numeroCheque: cheque.numeroCheque,
            librador: cheque.librador,
            fechaEmision: cheque.fechaEmision,
            monto: cheque.monto,
          });
        }
      }

      // 5. MENSAJE Y REDIRECCIÓN
      {
        /*chequesTercero:
>>>>>>> front
          modo === "tercero"
            ? chequesTercero
                .filter((c) => c.monto > 0)
                .map(({ idBanco, idCliente, ...c }) => c)
            : undefined,
        chequesMismoBanco:
          modo === "mismo_banco"
            ? chequesMismoBanco
                .filter((c) => c.monto > 0)
                .map(({ idCliente, ...c }) => c)
<<<<<<< HEAD
            : undefined,
      });
=======
            : undefined,*/
      }

>>>>>>> front
      notify.success(
        "Depósito registrado",
        "El depósito fue creado correctamente.",
      );
      router.push("/banco-tesoreria/depositos");
      router.refresh();
    } catch (error) {
      console.error("Error al crear depósito:", error);
      notify.error("Error", "No se pudo registrar el depósito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectorCompacto = "min-w-[180px] [&_button]:h-8 [&_button]:text-xs";

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Depósitos", href: "/banco-tesoreria/depositos" },
          { label: "Nuevo depósito" },
        ]}
      />

      <h1 className="text-xl font-bold tracking-tight">
        Nuevo depósito bancario
      </h1>

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
            onClick={() => router.push("/banco-tesoreria/depositos")}
          >
            Cancelar
          </Button>
          <Button
            className="h-8 cursor-pointer"
            onClick={handleGuardar}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Registrar depósito"}
          </Button>
        </div>
      </div>

      <div className="p-3 border rounded-lg bg-slate-50/40 shadow-sm mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-[13px]">Tipo de depósito</Label>
            <Select value={idTipoDeposito} onValueChange={handleTipoChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDeposito.map((t) => (
                  <SelectItem
                    key={t.idTipoDepositoBancario}
                    value={String(t.idTipoDepositoBancario)}
                  >
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[13px]">Fecha</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label className="text-[13px]">Concepto</Label>
            <Input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Descripción del depósito"
              className="h-9"
            />
          </div>
        </div>
      </div>

      {modo === "efectivo" && (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="px-3 py-2 bg-slate-50 border-b">
            <h2 className="font-semibold text-sm">Depósito en efectivo</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Cliente / librador</TableHead>
                <TableHead className="w-1/2 text-right">Monto (₲)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <ClienteSelector
                    clientesIniciales={clientes}
                    selectedClienteId={efectivoCliente?.idCliente}
                    onSelect={setEfectivoCliente}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    id="efectivoMonto"
                    type="text"
                    inputMode="numeric"
                    value={formatNumberDots(efectivoMonto)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setEfectivoMonto(parseInt(raw, 10) || 0);
                    }}
                    className="h-9 text-right font-semibold"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {modo === "tercero" && (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="flex justify-between items-center px-3 py-2 bg-slate-50 border-b">
            <h2 className="font-semibold text-sm">Cheques de terceros</h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 cursor-pointer"
              onClick={() =>
                setChequesTercero((prev) => [...prev, lineaTerceroVacia()])
              }
            >
              <Plus className="size-3" /> Agregar cheque
            </Button>
          </div>
          <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead className="min-w-[160px]">Banco emisor</TableHead>
                  <TableHead className="min-w-[120px]">Nº cheque</TableHead>
                  <TableHead className="min-w-[200px]">Librador</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead className="text-right min-w-[120px]">
                    Monto (₲)
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {chequesTercero.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground h-16"
                    >
                      Sin cheques. Use &quot;Agregar cheque&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  chequesTercero.map((linea, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className={selectorCompacto}>
                          <BancoSelector
                            bancos={bancos}
                            selectedId={linea.idBanco}
                            onSelect={(banco) => {
                              const next = [...chequesTercero];
                              next[idx] = {
                                ...linea,
                                idBanco: banco?.idBanco,
                                bancoEmisor: banco?.nombre ?? "",
                              };
                              setChequesTercero(next);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={linea.numeroCheque}
                          onChange={(e) => {
                            const next = [...chequesTercero];
                            next[idx] = {
                              ...linea,
                              numeroCheque: e.target.value,
                            };
                            setChequesTercero(next);
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <div className={selectorCompacto}>
                          <ClienteSelector
                            clientesIniciales={clientes}
                            selectedClienteId={linea.idCliente}
                            onSelect={(cliente) => {
                              const next = [...chequesTercero];
                              next[idx] = {
                                ...linea,
                                idCliente: cliente?.idCliente,
                                librador: cliente
                                  ? nombreCliente(
                                      cliente.nombres,
                                      cliente.apellidos,
                                    )
                                  : "",
                              };
                              setChequesTercero(next);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={linea.fechaEmision.split("T")[0]}
                          onChange={(e) => {
                            const next = [...chequesTercero];
                            next[idx] = {
                              ...linea,
                              fechaEmision: e.target.value,
                            };
                            setChequesTercero(next);
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberDots(linea.monto)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const next = [...chequesTercero];
                            next[idx] = {
                              ...linea,
                              monto: parseInt(raw, 10) || 0,
                            };
                            setChequesTercero(next);
                          }}
                          className="h-8 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() =>
                            setChequesTercero((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {modo === "mismo_banco" && (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="flex justify-between items-center px-3 py-2 bg-slate-50 border-b">
            <h2 className="font-semibold text-sm">Cheques del mismo banco</h2>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 cursor-pointer"
              onClick={() =>
                setChequesMismoBanco((prev) => [
                  ...prev,
                  lineaMismoBancoVacia(),
                ])
              }
            >
              <Plus className="size-3" /> Agregar cheque
            </Button>
          </div>
          <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead className="min-w-[120px]">Nº cheque</TableHead>
                  <TableHead className="min-w-[200px]">Librador</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead className="text-right min-w-[120px]">
                    Monto (₲)
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {chequesMismoBanco.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground h-16"
                    >
                      Sin cheques. Use &quot;Agregar cheque&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  chequesMismoBanco.map((linea, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Input
                          value={linea.numeroCheque}
                          onChange={(e) => {
                            const next = [...chequesMismoBanco];
                            next[idx] = {
                              ...linea,
                              numeroCheque: e.target.value,
                            };
                            setChequesMismoBanco(next);
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <div className={selectorCompacto}>
                          <ClienteSelector
                            clientesIniciales={clientes}
                            selectedClienteId={linea.idCliente}
                            onSelect={(cliente) => {
                              const next = [...chequesMismoBanco];
                              next[idx] = {
                                ...linea,
                                idCliente: cliente?.idCliente,
                                librador: cliente
                                  ? nombreCliente(
                                      cliente.nombres,
                                      cliente.apellidos,
                                    )
                                  : "",
                              };
                              setChequesMismoBanco(next);
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={linea.fechaEmision.split("T")[0]}
                          onChange={(e) => {
                            const next = [...chequesMismoBanco];
                            next[idx] = {
                              ...linea,
                              fechaEmision: e.target.value,
                            };
                            setChequesMismoBanco(next);
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberDots(linea.monto)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            const next = [...chequesMismoBanco];
                            next[idx] = {
                              ...linea,
                              monto: parseInt(raw, 10) || 0,
                            };
                            setChequesMismoBanco(next);
                          }}
                          className="h-8 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() =>
                            setChequesMismoBanco((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {modo === "desconocido" && idTipoDeposito && (
        <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-amber-50/50">
          El tipo &quot;{tipoSel?.nombre}&quot; no tiene un formulario
          configurado. Los nombres esperados en la API deben contener:
          &quot;efectivo&quot;, &quot;tercero&quot; o &quot;mismo&quot; (mismo
          banco).
        </p>
      )}

      {(modo === "efectivo" ||
        modo === "tercero" ||
        modo === "mismo_banco") && (
        <div className="flex justify-end mt-4 pt-4 border-t">
          <p className="text-2xl font-black text-primary">
            Total depósito:{" "}
            {formatMoney(totalDeposito, cuentaSel?.moneda ?? "PYG")}
          </p>
        </div>
      )}
    </>
  );
}
