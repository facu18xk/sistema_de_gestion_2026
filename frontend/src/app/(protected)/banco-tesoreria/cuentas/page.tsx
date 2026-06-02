"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableHead } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { CuentaBancariaForm } from "@/components/banco-tesoreria/cuenta-bancaria-form";
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import { textoCoincide } from "@/lib/list-filters";
import { bancosAPI } from "@/services/bancosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { tiposCuentasBancariasAPI } from "@/services/tiposCuentasBancariasAPI";
import { cuentasContablesAPI } from "@/services/cuentasContablesAPI";
import { formatMoney } from "@/lib/format-currency";
import { notify } from "@/lib/notifications";
import { Badge } from "@/components/ui/badge";
import type {
  Banco,
  CuentaBancaria,
  CuentaBancariaSaveDTO,
  CuentaContable,
  TipoCuentaBancaria,
} from "@/types/types";

export default function CuentasBancariasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [todasLasCuentas, setTodasLasCuentas] = useState<CuentaBancaria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuentaBancaria[]>([]);
  const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>(
    [],
  );

  const [cuentaAEditar, setCuentaAEditar] = useState<CuentaBancaria | null>(
    null,
  );
  const [cuentaAEliminar, setCuentaAEliminar] = useState<CuentaBancaria | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarCatalogos = async () => {
    try {
      const [resBancos, resTipos, resContables] = await Promise.all([
        bancosAPI.getAll(1, 200),
        tiposCuentasBancariasAPI.getAll(1, 50),
        cuentasContablesAPI.getAll(1, 500),
      ]);
      setBancos(resBancos.items);
      setTiposCuenta(resTipos.items);
      setCuentasContables(resContables.items);
    } catch (error) {
      console.error("Error al cargar catálogos de tesorería:", error);
      notify.error(
        "Error de conexión",
        "No se pudieron cargar bancos o catálogos auxiliares.",
      );
    }
  };

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await cuentasBancariasAPI.getAll(1, 500);
      setTodasLasCuentas(res.items);
    } catch (error) {
      console.error("Error al cargar cuentas bancarias:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener el listado de cuentas bancarias.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
    cargarPagina();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const cuentasFiltradas = useMemo(() => {
    return todasLasCuentas.filter((c) =>
      textoCoincide(
        searchTerm,
        c.banco,
        c.tipoCuentaBancaria,
        c.numeroCuenta,
        c.cuentaContable,
        c.moneda,
      ),
    );
  }, [todasLasCuentas, searchTerm]);

  const totalPages = Math.ceil(cuentasFiltradas.length / itemsPerPage) || 1;

  const cuentas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cuentasFiltradas.slice(start, start + itemsPerPage);
  }, [cuentasFiltradas, currentPage, itemsPerPage]);

  const handleCrearNuevo = () => {
    if (bancos.filter((b) => b.activo).length === 0) {
      notify.warning(
        "Sin bancos",
        "Registre al menos un banco antes de crear una cuenta.",
      );
      return;
    }
    setCuentaAEditar(null);
    setIsSheetOpen(true);
  };

  const handleEditar = (cuenta: CuentaBancaria) => {
    setCuentaAEditar(cuenta);
    setIsSheetOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!cuentaAEliminar) return;

    try {
      await cuentasBancariasAPI.delete(cuentaAEliminar.idCuentaBancaria);
      notify.success("Eliminada", "La cuenta bancaria fue eliminada.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      notify.error("Error", "No se pudo eliminar la cuenta bancaria.");
    } finally {
      setIsAlertOpen(false);
      setCuentaAEliminar(null);
    }
  };

  const handleFormSubmit = async (data: CuentaBancariaSaveDTO) => {
    try {
      if (cuentaAEditar) {
        await cuentasBancariasAPI.update(cuentaAEditar.idCuentaBancaria, data);
        notify.success("Actualizada", "Cuenta bancaria actualizada.");
      } else {
        await cuentasBancariasAPI.create(data);
        notify.success("Registrada", "Nueva cuenta bancaria creada.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar cuenta:", error);
      notify.error("Error", "No se pudo guardar la cuenta bancaria.");
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Cuentas bancarias" },
        ]}
      />

      <PageHeader
        title="Listado de cuentas bancarias"
        buttonLabel="Nueva cuenta"
        onButtonClick={handleCrearNuevo}
      />

      <TesoreriaFiltrosListado
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por banco, número, tipo o cuenta contable..."
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta bancaria?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la cuenta{" "}
              <span className="font-semibold text-foreground">
                {cuentaAEliminar?.numeroCuenta} — {cuentaAEliminar?.banco}
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          caption="Cuentas bancarias de la empresa."
          headerRow={
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nº cuenta</TableHead>
              <TableHead>Cuenta contable</TableHead>
              <TableHead>Moneda</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Saldo disponible</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {cuentas.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="h-24 text-center text-muted-foreground"
              >
                No hay cuentas bancarias registradas.
              </TableCell>
            </TableRow>
          ) : (
            cuentas.map((c) => (
              <TableRow key={c.idCuentaBancaria}>
                <TableCell className="font-medium">{c.banco}</TableCell>
                <TableCell>{c.tipoCuentaBancaria}</TableCell>
                <TableCell>{c.numeroCuenta}</TableCell>
                <TableCell className="max-w-[140px] truncate text-sm">
                  {c.cuentaContable}
                </TableCell>
                <TableCell>{c.moneda}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(c.saldo, c.moneda)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(c.saldoDisponible, c.moneda)}
                </TableCell>
                <TableCell>
                  <Badge variant={c.activa ? "activo" : "destructive"}>
                    {c.activa ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditar(c)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => {
                      setCuentaAEliminar(c);
                      setIsAlertOpen(true);
                    }}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </DataTable>
      )}

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={
          cuentaAEditar ? "Editar cuenta bancaria" : "Nueva cuenta bancaria"
        }
        contentClassName="px-6 sm:max-w-[560px] overflow-y-auto"
      >
        <CuentaBancariaForm
          key={cuentaAEditar?.idCuentaBancaria ?? "nuevo"}
          cuentaEditada={cuentaAEditar}
          bancos={bancos}
          tiposCuenta={tiposCuenta}
          cuentasContables={cuentasContables}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
