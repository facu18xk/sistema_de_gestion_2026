"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
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
import { PeriodoContableForm } from "@/components/contabilidad/periodo-contable-form";
import { periodosContablesAPI } from "@/services/periodosContablesAPI";
import { procesosContablesAPI } from "@/services/procesosContablesAPI";
import { notify } from "@/lib/notifications";
import {
  PeriodoContableDTO,
  PeriodoContableSaveDTO,
  ProcesoContableDTO,
} from "@/types/types";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (typeof response?.data === "string") return response.data;
    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      return String((response.data as { message?: unknown }).message);
    }
  }

  return "No se pudo completar la operación.";
}

function getMonthName(month: number) {
  return new Date(2000, month - 1, 1).toLocaleDateString("es-PY", {
    month: "long",
  });
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export default function PeriodosContablesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [periodoAEliminar, setPeriodoAEliminar] =
    useState<PeriodoContableDTO | null>(null);

  const [periodos, setPeriodos] = useState<PeriodoContableDTO[]>([]);
  const [procesos, setProcesos] = useState<ProcesoContableDTO[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const [periodosResponse, procesosResponse] = await Promise.all([
        periodosContablesAPI.getAll(currentPage, itemsPerPage),
        procesosContablesAPI.getAll(1, 1000),
      ]);

      setPeriodos(periodosResponse.items);
      setProcesos(procesosResponse.items);
      setTotalPages(periodosResponse.totalPages);
    } catch (error) {
      console.error("Error al cargar períodos contables:", error);
      notify.error("Error de conexión", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, [currentPage]);

  const handleFormSubmit = async (data: PeriodoContableSaveDTO) => {
    try {
      await periodosContablesAPI.create(data);
      notify.success("Registrado", "Nuevo Período Contable guardado.");
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar período contable:", error);
      notify.error("Error al guardar", getErrorMessage(error));
    }
  };

  const confirmarEliminacion = async () => {
    if (!periodoAEliminar) return;

    try {
      await periodosContablesAPI.delete(periodoAEliminar.idPeriodoContable);
      notify.success(
        "Eliminado",
        "El período contable fue eliminado correctamente.",
      );
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar período contable:", error);
      notify.error("Error al eliminar", getErrorMessage(error));
    } finally {
      setIsAlertOpen(false);
      setPeriodoAEliminar(null);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Contabilidad", href: "#" },
          { label: "Períodos Contables" },
        ]}
      />

      <PageHeader
        title="Listado de Períodos Contables"
        buttonLabel="Nuevo Período Contable"
        onButtonClick={() => setIsSheetOpen(true)}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente el
              período contable.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Período
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
          caption="Lista de períodos contables."
          headerRow={
            <TableRow>
              <TableHead>Proceso Contable</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Mes</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {periodos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No hay períodos contables registrados.
              </TableCell>
            </TableRow>
          ) : (
            periodos.map((periodo) => (
              <TableRow key={periodo.idPeriodoContable}>
                <TableCell>{periodo.procesoContable}</TableCell>
                <TableCell>{periodo.anho}</TableCell>
                <TableCell className="capitalize">
                  {getMonthName(periodo.mes)}
                </TableCell>
                <TableCell>
                  {formatDateOnly(periodo.fechaInicio)}
                </TableCell>
                <TableCell>
                  {formatDateOnly(periodo.fechaFin)}
                </TableCell>
                <TableCell>
                  {periodo.estado === "Habilitado" ? (
                    <Badge variant="habilitado">{periodo.estado}</Badge>
                  ) : (
                    <Badge variant="destructive">{periodo.estado}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPeriodoAEliminar(periodo);
                      setIsAlertOpen(true);
                    }}
                    className="cursor-pointer"
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
        title="Nuevo Período Contable"
        description="Información del período contable."
      >
        <PeriodoContableForm
          key={isSheetOpen ? "nuevo-periodo" : "cerrado"}
          procesos={procesos}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
