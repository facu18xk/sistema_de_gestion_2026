"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableHead } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { DataTable } from "@/components/shared/data-table";
import { chequesEmitidosAPI } from "@/services/chequesEmitidosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { notify } from "@/lib/notifications";
import type { ChequeEmitido, CuentaBancaria } from "@/types/types";

export default function ChequesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cheques, setCheques] = useState<ChequeEmitido[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const monedaPorCuenta = (idCuenta: number) =>
    cuentas.find((c) => c.idCuentaBancaria === idCuenta)?.moneda ?? "PYG";

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [resCheques, resCuentas] = await Promise.all([
        chequesEmitidosAPI.getAll(currentPage, 10),
        cuentasBancariasAPI.getAll(1, 200),
      ]);
      setCheques(resCheques.items);
      setTotalPages(resCheques.totalPages);
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
  }, [currentPage]);

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
              <TableHead>Pago</TableHead>
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
                <TableCell>
                  {c.fechaPago ? formatDate(c.fechaPago) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(c.monto, monedaPorCuenta(c.idCuentaBancaria))}
                </TableCell>
                <TableCell>{c.estado}</TableCell>
              </TableRow>
            ))
          )}
        </DataTable>
      )}
    </>
  );
}
