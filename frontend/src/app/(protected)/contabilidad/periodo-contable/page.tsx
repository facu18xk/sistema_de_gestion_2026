"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { TableRow, TableCell, TableHead } from "@/components/ui/table";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { DataTable } from "@/components/shared/data-table";

import { periodosContablesAPI } from "@/services/periodosContablesAPI";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notifications";

export default function PeriodosContablesPage() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [periodoAEliminar, setPeriodoAEliminar] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [periodos, setPeriodos] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [itemsPerPage] = useState(10);

  const meses = [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const response = await periodosContablesAPI.getAll(
        currentPage,
        itemsPerPage,
      );

      setPeriodos(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error al cargar períodos contables:", error);

      notify.error(
        "Error de conexión",
        "No se pudieron obtener los períodos contables.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, [currentPage]);

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

      notify.error(
        "Error al eliminar",
        "No se pudo eliminar el período contable.",
      );
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

      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          Listado de Períodos Contables
        </h1>
      </div>

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
              <TableHead>Acciones</TableHead>
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
            periodos.map((p) => (
              <TableRow key={p.idPeriodoContable}>
                <TableCell>{p.procesoContable}</TableCell>
                <TableCell>{p.anho}</TableCell>
                <TableCell>{meses[p.mes]}</TableCell>

                <TableCell>
                  {new Date(p.fechaInicio).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {new Date(p.fechaFin).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  {p.estado === "Habilitado" ? (
                    <Badge variant="habilitado">{p.estado}</Badge>
                  ) : (
                    <Badge variant="destructive">{p.estado}</Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPeriodoAEliminar(p);
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
    </>
  );
}
