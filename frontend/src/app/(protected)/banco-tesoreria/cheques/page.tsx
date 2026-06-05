"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { DataTable } from "@/components/shared/data-table";
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import { CuentaBancariaFilterCombobox } from "@/components/banco-tesoreria/cuenta-bancaria-filter-combobox";
import { chequesEmitidosAPI } from "@/services/chequesEmitidosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { enRangoFecha, rangoFechaPorDefecto, textoCoincide } from "@/lib/list-filters";
import { notify } from "@/lib/notifications";
import type { ChequeEmitido, CuentaBancaria } from "@/types/types";
import { Badge } from "@/components/ui/badge";

const defaultRango = rangoFechaPorDefecto();

export default function ChequesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todosLosCheques, setTodosLosCheques] = useState<ChequeEmitido[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState(defaultRango.desde);
  const [fechaHasta, setFechaHasta] = useState(defaultRango.hasta);
  const [idCuentaFiltro, setIdCuentaFiltro] = useState("all");

  const monedaPorCuenta = (idCuenta: number) =>
    cuentas.find((c) => c.idCuentaBancaria === idCuenta)?.moneda ?? "PYG";

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [resCheques, resCuentas] = await Promise.all([
        chequesEmitidosAPI.getAll(1, 500),
        cuentasBancariasAPI.getAll(1, 200),
      ]);
      setTodosLosCheques(resCheques.items);
      setCuentas(resCuentas.items);
    } catch (error) {
      console.error("Error al cargar cheques:", error);
      notify.error("Error de conexión", "No se pudo obtener el listado.");
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

  const chequesFiltrados = useMemo(() => {
    return todosLosCheques.filter((c) => {
      if (idCuentaFiltro !== "all" && c.idCuentaBancaria !== Number(idCuentaFiltro)) {
        return false;
      }
      if (!enRangoFecha(c.fechaEmision, fechaDesde, fechaHasta)) return false;
      return textoCoincide(
        searchTerm,
        c.numeroCheque,
        c.beneficiario,
        c.cuentaBancaria,
        c.estado,
      );
    });
  }, [todosLosCheques, searchTerm, fechaDesde, fechaHasta, idCuentaFiltro]);

  const totalPages = Math.ceil(chequesFiltrados.length / itemsPerPage) || 1;

  const cheques = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return chequesFiltrados.slice(start, start + itemsPerPage);
  }, [chequesFiltrados, currentPage, itemsPerPage]);

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Cheques" },
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Cheques emitidos</h1>
        <Button size="sm" className="h-8 cursor-pointer" asChild>
          <Link href="/banco-tesoreria/cheques/emitir">Emitir cheque</Link>
        </Button>
      </div>

      <TesoreriaFiltrosListado
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nº cheque, beneficiario, cuenta o estado..."
        showDateRange
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
        dateFromLabel="Emisión desde"
        dateToLabel="Emisión hasta"
      >
        <div className="grid gap-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground">Cuenta</Label>
          <CuentaBancariaFilterCombobox
            cuentas={cuentas}
            value={idCuentaFiltro}
            onValueChange={setIdCuentaFiltro}
          />
        </div>
      </TesoreriaFiltrosListado>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          caption="Cheques emitidos desde tesorería u órdenes de pago."
          headerRow={
            <TableRow>
              <TableHead>Nº cheque</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Beneficiario</TableHead>
              <TableHead>Emisión</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {cheques.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No hay cheques emitidos registrados.
              </TableCell>
            </TableRow>
          ) : (
            cheques.map((c) => (
              <TableRow key={c.idChequeEmitido}>
                <TableCell className="font-medium">{c.numeroCheque}</TableCell>
                <TableCell className="max-w-[140px] truncate text-sm">
                  {c.cuentaBancaria}
                </TableCell>
                <TableCell>{c.beneficiario}</TableCell>
                <TableCell>{formatDate(c.fechaEmision)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(c.monto, monedaPorCuenta(c.idCuentaBancaria))}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.estado === "Emitido"
                        ? "activo"
                        : c.estado === "Rechazado"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {c.estado}
                  </Badge></TableCell>
              </TableRow>
            ))
          )}
        </DataTable>
      )}
    </>
  );
}
