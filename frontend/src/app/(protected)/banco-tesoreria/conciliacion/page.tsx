"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { FormSheet } from "@/components/shared/form-sheet";
import { CuentaBancariaSelector } from "@/components/banco-tesoreria/cuenta-bancaria-selector";
import { ConciliarChequeForm } from "@/components/banco-tesoreria/conciliar-cheque-form";
import { chequesEmitidosAPI } from "@/services/chequesEmitidosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { enRangoFecha, rangoFechaPorDefecto, textoCoincide } from "@/lib/list-filters";
import { notify } from "@/lib/notifications";
import type { ChequeEmitido, CuentaBancaria } from "@/types/types";

function esChequePendiente(cheque: ChequeEmitido): boolean {
    if (!cheque.fechaPago) return true;
    const estado = cheque.estado?.toLowerCase() ?? "";
    return estado.includes("emitido") || estado.includes("pendiente");
}

const defaultRango = rangoFechaPorDefecto();

export default function ConciliacionBancariaPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
    const [cuentaSel, setCuentaSel] = useState<CuentaBancaria | null>(null);
    const [cheques, setCheques] = useState<ChequeEmitido[]>([]);

    const [fechaDesde, setFechaDesde] = useState(defaultRango.desde);
    const [fechaHasta, setFechaHasta] = useState(defaultRango.hasta);
    const [searchTerm, setSearchTerm] = useState("");
    const [saldoExtracto, setSaldoExtracto] = useState<string>("");

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [chequeAConciliar, setChequeAConciliar] = useState<ChequeEmitido | null>(null);

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [resCuentas, resCheques] = await Promise.all([
                cuentasBancariasAPI.getAll(1, 200),
                chequesEmitidosAPI.getAll(1, 500),
            ]);
            setCuentas(resCuentas.items);
            setCheques(resCheques.items);
        } catch (error) {
            console.error("Error en conciliación:", error);
            notify.error("Error", "No se pudieron cargar los datos de conciliación.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const chequesFiltrados = useMemo(() => {
        if (!cuentaSel) return [];
        return cheques.filter(
            (c) =>
                c.idCuentaBancaria === cuentaSel.idCuentaBancaria &&
                enRangoFecha(c.fechaEmision, fechaDesde, fechaHasta) &&
                textoCoincide(
                    searchTerm,
                    c.numeroCheque,
                    c.beneficiario,
                    c.estado,
                ),
        );
    }, [cheques, cuentaSel, fechaDesde, fechaHasta, searchTerm]);

    const chequesPendientes = chequesFiltrados.filter(esChequePendiente);

    const totalChequesPendientes = chequesPendientes.reduce((acc, c) => acc + c.monto, 0);
    const saldoLibro = cuentaSel?.saldo ?? 0;
    const saldoExtractoNum = saldoExtracto ? Number(saldoExtracto) : null;
    const diferencia =
        saldoExtractoNum !== null && !Number.isNaN(saldoExtractoNum)
            ? saldoExtractoNum - saldoLibro
            : null;

    const handleConciliarSubmit = async (fechaPago: string) => {
        if (!chequeAConciliar) return;
        try {
            await chequesEmitidosAPI.conciliar(chequeAConciliar.idChequeEmitido, {
                fechaPago,
            });
            notify.success("Conciliado", "Cheque marcado como pagado.");
            setIsSheetOpen(false);
            setChequeAConciliar(null);
            await cargarDatos();
        } catch (error) {
            console.error("Error al conciliar:", error);
            notify.error("Error", "No se pudo conciliar el cheque.");
        }
    };

    return (
        <>
            <PageBreadcrumb
                steps={[
                    { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
                    { label: "Conciliación bancaria" },
                ]}
            />

            <h1 className="text-xl font-bold tracking-tight">Conciliación bancaria</h1>

            <div className="w-full max-w-md my-2">
                <CuentaBancariaSelector
                    cuentas={cuentas}
                    selectedId={cuentaSel?.idCuentaBancaria}
                    onSelect={setCuentaSel}
                />
            </div>

            <TesoreriaFiltrosListado
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar cheques del período..."
                showDateRange
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onFechaDesdeChange={setFechaDesde}
                onFechaHastaChange={setFechaHasta}
            />

            {cuentaSel && (
                <div className="p-3 border rounded-lg bg-slate-50/40 shadow-sm mb-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <p className="text-[12px] text-muted-foreground uppercase">Saldo en libros</p>
                            <p className="text-lg font-bold">
                                {formatMoney(saldoLibro, cuentaSel.moneda)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[12px] text-muted-foreground uppercase">
                                Saldo según extracto
                            </p>
                            <Input
                                type="number"
                                placeholder="Ingrese saldo del banco"
                                value={saldoExtracto}
                                onChange={(e) => setSaldoExtracto(e.target.value)}
                                className="h-9 mt-0.5"
                            />
                        </div>
                        <div>
                            <p className="text-[12px] text-muted-foreground uppercase">Diferencia</p>
                            <p
                                className={`text-lg font-bold ${diferencia !== null && diferencia !== 0
                                        ? "text-amber-600"
                                        : "text-emerald-600"
                                    }`}
                            >
                                {diferencia !== null
                                    ? formatMoney(diferencia, cuentaSel.moneda)
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[12px] text-muted-foreground uppercase">
                                Cheques pendientes
                            </p>
                            <p className="text-lg font-semibold text-amber-700">
                                {formatMoney(totalChequesPendientes, cuentaSel.moneda)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-10">
                    <Loader2 className="animate-spin text-primary" />
                </div>
            ) : !cuentaSel ? (
                <p className="text-center text-muted-foreground py-12 border rounded-lg">
                    Seleccione una cuenta bancaria para iniciar la conciliación.
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="px-3 py-2 bg-slate-50 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-sm">
                                Cheques emitidos — conciliar ({chequesFiltrados.length})
                            </h2>
                        </div>
                        <div className="max-h-[380px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-slate-50 z-10">
                                    <TableRow>
                                        <TableHead>Nº</TableHead>
                                        <TableHead>Beneficiario</TableHead>
                                        <TableHead className="text-right">Monto</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {chequesFiltrados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground h-20">
                                                Sin cheques en el período.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        chequesFiltrados.map((c) => (
                                            <TableRow key={c.idChequeEmitido}>
                                                <TableCell className="font-medium text-sm">
                                                    {c.numeroCheque}
                                                </TableCell>
                                                <TableCell className="text-sm max-w-[120px] truncate">
                                                    {c.beneficiario}
                                                </TableCell>
                                                <TableCell className="text-right text-sm font-medium">
                                                    {formatMoney(c.monto, cuentaSel.moneda)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {esChequePendiente(c) ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 gap-1 cursor-pointer"
                                                            onClick={() => {
                                                                setChequeAConciliar(c);
                                                                setIsSheetOpen(true);
                                                            }}
                                                        >
                                                            <CheckCircle2 className="size-3" />
                                                            Conciliar
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-emerald-600">
                                                            {c.fechaPago ? formatDate(c.fechaPago) : "—"}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}

            <FormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                title="Conciliar cheque"
            >
                {chequeAConciliar && cuentaSel && (
                    <ConciliarChequeForm
                        key={chequeAConciliar.idChequeEmitido}
                        cheque={chequeAConciliar}
                        moneda={cuentaSel.moneda}
                        onSubmit={handleConciliarSubmit}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                )}
            </FormSheet>
    </>
  );
}
