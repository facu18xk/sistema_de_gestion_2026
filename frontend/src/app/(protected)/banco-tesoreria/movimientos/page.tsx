"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import { CuentaBancariaFilterCombobox } from "@/components/banco-tesoreria/cuenta-bancaria-filter-combobox";
import { MovimientoBancarioForm } from "@/components/banco-tesoreria/movimiento-bancario-form";
import { movimientosBancariosAPI } from "@/services/movimientosBancariosAPI";
import { cuentasBancariasAPI } from "@/services/cuentasBancariasAPI";
import { tiposMovimientosBancariosAPI } from "@/services/tiposMovimientosBancariosAPI";
import { formatMoney } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { enRangoFecha, rangoFechaPorDefecto, textoCoincide } from "@/lib/list-filters";
import { notify } from "@/lib/notifications";
import type {
  CuentaBancaria,
  MovimientoBancario,
  MovimientoBancarioSaveDTO,
  TipoMovimientoBancario,
} from "@/types/types";

const defaultRango = rangoFechaPorDefecto();

export default function MovimientosBancariosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [todosLosMovimientos, setTodosLosMovimientos] = useState<MovimientoBancario[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimientoBancario[]>([]);

  const [movimientoAEditar, setMovimientoAEditar] =
    useState<MovimientoBancario | null>(null);
  const [movimientoAEliminar, setMovimientoAEliminar] =
    useState<MovimientoBancario | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState(defaultRango.desde);
  const [fechaHasta, setFechaHasta] = useState(defaultRango.hasta);
  const [idCuentaFiltro, setIdCuentaFiltro] = useState("all");

  const cargarCatalogos = async () => {
    try {
      const [resCuentas, resTipos] = await Promise.all([
        cuentasBancariasAPI.getAll(1, 200),
        tiposMovimientosBancariosAPI.getAll(1, 50),
      ]);
      setCuentas(resCuentas.items);
      setTiposMovimiento(resTipos.items);
    } catch (error) {
      console.error("Error al cargar catálogos:", error);
    }
  };

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await movimientosBancariosAPI.getAll(1, 500);
      setTodosLosMovimientos(res.items);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener el listado de movimientos bancarios.",
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
  }, [searchTerm, fechaDesde, fechaHasta, idCuentaFiltro]);

  const movimientosFiltrados = useMemo(() => {
    return todosLosMovimientos.filter((m) => {
      if (idCuentaFiltro !== "all" && m.idCuentaBancaria !== Number(idCuentaFiltro)) {
        return false;
      }
      if (!enRangoFecha(m.fecha, fechaDesde, fechaHasta)) return false;
      return textoCoincide(
        searchTerm,
        m.concepto,
        m.referencia,
        m.cuentaBancaria,
        m.tipoMovimientoBancario,
      );
    });
  }, [todosLosMovimientos, searchTerm, fechaDesde, fechaHasta, idCuentaFiltro]);

  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage) || 1;

  const movimientos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return movimientosFiltrados.slice(start, start + itemsPerPage);
  }, [movimientosFiltrados, currentPage, itemsPerPage]);

  const monedaPorCuenta = (idCuenta: number) =>
    cuentas.find((c) => c.idCuentaBancaria === idCuenta)?.moneda ?? "PYG";

  const handleCrearNuevo = () => {
    setMovimientoAEditar(null);
    setIsSheetOpen(true);
  };

  const handleEditar = (mov: MovimientoBancario) => {
    if (mov.idOrdenMedioPagoCompra || mov.idChequeEmitido) {
      notify.warning(
        "Movimiento automático",
        "Los movimientos generados por pagos o cheques no se editan desde aquí.",
      );
      return;
    }
    setMovimientoAEditar(mov);
    setIsSheetOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!movimientoAEliminar) return;
    if (
      movimientoAEliminar.idOrdenMedioPagoCompra ||
      movimientoAEliminar.idChequeEmitido
    ) {
      notify.warning(
        "No permitido",
        "No puede eliminar movimientos vinculados a órdenes de pago o cheques.",
      );
      setIsAlertOpen(false);
      setMovimientoAEliminar(null);
      return;
    }

    try {
      await movimientosBancariosAPI.delete(
        movimientoAEliminar.idMovimientoBancario,
      );
      notify.success("Eliminado", "Movimiento bancario eliminado.");
      await cargarPagina();
    } catch {
      notify.error("Error", "No se pudo eliminar el movimiento.");
    } finally {
      setIsAlertOpen(false);
      setMovimientoAEliminar(null);
    }
  };

  const handleFormSubmit = async (data: MovimientoBancarioSaveDTO) => {
    try {
      if (movimientoAEditar) {
        await movimientosBancariosAPI.update(
          movimientoAEditar.idMovimientoBancario,
          data,
        );
        notify.success("Actualizado", "Movimiento actualizado.");
      } else {
        await movimientosBancariosAPI.create(data);
        notify.success("Registrado", "Movimiento bancario registrado.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch {
      notify.error("Error", "No se pudo guardar el movimiento.");
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Movimientos bancarios" },
        ]}
      />

      <PageHeader
        title="Listado de movimientos bancarios"
        buttonLabel="Nuevo movimiento"
        onButtonClick={handleCrearNuevo}
      />

      <TesoreriaFiltrosListado
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por concepto, referencia, cuenta o tipo..."
        showDateRange
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        onFechaDesdeChange={setFechaDesde}
        onFechaHastaChange={setFechaHasta}
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

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el movimiento &quot;{movimientoAEliminar?.concepto}
              &quot;. Esta acción no se puede deshacer.
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
          caption="Débitos y créditos registrados en cuentas bancarias."
          headerRow={
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {movimientos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No hay movimientos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            movimientos.map((m) => (
              <TableRow key={m.idMovimientoBancario}>
                <TableCell>{formatDate(m.fecha)}</TableCell>
                <TableCell className="max-w-[120px] truncate text-sm">
                  {m.cuentaBancaria}
                </TableCell>
                <TableCell>{m.tipoMovimientoBancario}</TableCell>
                <TableCell>{m.concepto}</TableCell>
                <TableCell className="text-right font-medium">
                  {m.referencia || "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMoney(m.monto, monedaPorCuenta(m.idCuentaBancaria))}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditar(m)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => {
                      setMovimientoAEliminar(m);
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
          movimientoAEditar
            ? "Editar movimiento bancario"
            : "Nuevo movimiento bancario"
        }
        contentClassName="px-6 sm:max-w-[560px] overflow-y-auto"
      >
        <MovimientoBancarioForm
          key={movimientoAEditar?.idMovimientoBancario ?? "nuevo"}
          movimientoEditado={movimientoAEditar}
          cuentas={cuentas}
          tiposMovimiento={tiposMovimiento}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
