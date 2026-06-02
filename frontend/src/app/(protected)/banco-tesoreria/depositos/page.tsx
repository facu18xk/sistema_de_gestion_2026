"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableHead } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { DataTable } from "@/components/shared/data-table";
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import { depositosBancariosAPI } from "@/services/depositosBancariosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { enRangoFecha, rangoFechaPorDefecto, textoCoincide } from "@/lib/list-filters";
import { notify } from "@/lib/notifications";
import type { CuentaBancaria, DepositoBancario } from "@/types/types";

const defaultRango = rangoFechaPorDefecto();

function puedeConfirmar(estado: string): boolean {
  const e = estado.toLowerCase();
  return e.includes("pendiente") || e.includes("borrador");
}

function puedeRechazar(estado: string): boolean {
  const e = estado.toLowerCase();
  return e.includes("pendiente") || e.includes("borrador");
}

export default function DepositosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todosLosDepositos, setTodosLosDepositos] = useState<DepositoBancario[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [accionId, setAccionId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState(defaultRango.desde);
  const [fechaHasta, setFechaHasta] = useState(defaultRango.hasta);
  const [idCuentaFiltro, setIdCuentaFiltro] = useState("all");

  const monedaPorCuenta = (idCuenta: number) =>
    cuentas.find((c) => c.idCuentaBancaria === idCuenta)?.moneda ?? "PYG";

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [resDep, resCuentas] = await Promise.all([
        depositosBancariosAPI.getAll(1, 500),
        cuentasBancariasAPI.getAll(1, 200),
      ]);
      setTodosLosDepositos(resDep.items);
      setCuentas(resCuentas.items);
    } catch (error) {
      console.error("Error al cargar depósitos:", error);
      notify.error("Error", "No se pudo obtener el listado de depósitos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fechaDesde, fechaHasta, idCuentaFiltro]);

  const depositosFiltrados = useMemo(() => {
    return todosLosDepositos.filter((d) => {
      if (idCuentaFiltro !== "all" && d.idCuentaBancaria !== Number(idCuentaFiltro)) {
        return false;
      }
      if (!enRangoFecha(d.fecha, fechaDesde, fechaHasta)) return false;
      return textoCoincide(
        searchTerm,
        d.concepto,
        d.cuentaBancaria,
        d.tipoDepositoBancario,
        d.estado,
      );
    });
  }, [todosLosDepositos, searchTerm, fechaDesde, fechaHasta, idCuentaFiltro]);

  const totalPages = Math.ceil(depositosFiltrados.length / itemsPerPage) || 1;

  const depositos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return depositosFiltrados.slice(start, start + itemsPerPage);
  }, [depositosFiltrados, currentPage, itemsPerPage]);

  const handleConfirmar = async (id: number) => {
    setAccionId(id);
    try {
      await depositosBancariosAPI.confirmar(id);
      notify.success("Confirmado", "Depósito confirmado correctamente.");
      await cargarDatos();
    } catch (error) {
      notify.error("Error", "No se pudo confirmar el depósito.");
    } finally {
      setAccionId(null);
    }
  };

  const handleRechazar = async (id: number) => {
    setAccionId(id);
    try {
      await depositosBancariosAPI.rechazar(id);
      notify.warning("Rechazado", "Depósito rechazado.");
      await cargarDatos();
    } catch (error) {
      notify.error("Error", "No se pudo rechazar el depósito.");
    } finally {
      setAccionId(null);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Depósitos" },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">
          Listado de depósitos bancarios
        </h1>
        <Button size="sm" className="h-8 cursor-pointer" asChild>
          <Link href="/banco-tesoreria/depositos/nuevo">Nuevo depósito</Link>
        </Button>
      </div>

      <TesoreriaFiltrosListado
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por concepto, cuenta, tipo o estado..."
        showDateRange
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
      >
        <div className="grid gap-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground">Cuenta</Label>
          <Select value={idCuentaFiltro} onValueChange={setIdCuentaFiltro}>
            <SelectTrigger className="h-9 bg-white">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las cuentas</SelectItem>
              {cuentas.map((c) => (
                <SelectItem
                  key={c.idCuentaBancaria}
                  value={String(c.idCuentaBancaria)}
                >
                  {c.banco} — {c.numeroCuenta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TesoreriaFiltrosListado>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          caption="Depósitos registrados en cuentas bancarias."
          headerRow={
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {depositos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No hay depósitos registrados.
              </TableCell>
            </TableRow>
          ) : (
            depositos.map((d) => (
              <TableRow key={d.idDepositoBancario}>
                <TableCell>{formatDate(d.fecha)}</TableCell>
                <TableCell className="max-w-[140px] truncate text-sm">
                  {d.cuentaBancaria}
                </TableCell>
                <TableCell>{d.tipoDepositoBancario}</TableCell>
                <TableCell className="max-w-[160px] truncate">
                  {d.concepto}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(d.monto, monedaPorCuenta(d.idCuentaBancaria))}
                </TableCell>
                <TableCell>{d.estado}</TableCell>
                <TableCell className="text-right space-x-1">
                  {puedeConfirmar(d.estado) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 cursor-pointer"
                      disabled={accionId === d.idDepositoBancario}
                      onClick={() => handleConfirmar(d.idDepositoBancario)}
                    >
                      <CheckCircle2 className="size-3" />
                      Confirmar
                    </Button>
                  )}
                  {puedeRechazar(d.estado) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 cursor-pointer text-destructive"
                      disabled={accionId === d.idDepositoBancario}
                      onClick={() => handleRechazar(d.idDepositoBancario)}
                    >
                      <XCircle className="size-3" />
                      Rechazar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </DataTable>
      )}
    </>
  );
}
