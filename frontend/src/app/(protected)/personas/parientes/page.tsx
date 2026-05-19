"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
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

import { DataTable } from "@/components/shared/data-table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { FormSheet } from "@/components/shared/form-sheet";
import { ParienteForm } from "@/components/personas/parientes-form";
import { empleadosAPI } from "@/services/empleadosAPI";
import { parientesAPI } from "@/services/parientesAPI";
import { Empleado, Pariente, ParienteSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function ParientesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [parientes, setParientes] = useState<Pariente[]>([]);
  const [parienteAEditar, setParienteAEditar] = useState<Pariente | null>(null);
  const [parienteAEliminar, setParienteAEliminar] = useState<Pariente | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const [resParientes, resEmpleados] = await Promise.all([
        parientesAPI.getAll(currentPage, itemsPerPage),

        empleadosAPI.getAll(1, 999),
      ]);

      setParientes(resParientes.items);
      setTotalPages(resParientes.totalPages);
      setEmpleados(resEmpleados.items);
    } catch (error) {
      console.error("Error al cargar parientes:", error);

      notify.error("Error", "No se pudo obtener la lista de parientes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, [currentPage]);

  const handleCrearNuevo = () => {
    setParienteAEditar(null);
    setIsSheetOpen(true);
  };

  const handleEditar = (pariente: Pariente) => {
    setParienteAEditar(pariente);
    setIsSheetOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!parienteAEliminar) return;

    try {
      await parientesAPI.delete(parienteAEliminar.idPariente);

      notify.success("Eliminado", "Pariente eliminado correctamente.");

      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar pariente:", error);

      notify.error("Error", "No se pudo eliminar.");
    } finally {
      setIsAlertOpen(false);
      setParienteAEliminar(null);
    }
  };

  const handleFormSubmit = async (data: ParienteSaveDTO) => {
    try {
      if (parienteAEditar) {
        await parientesAPI.update(parienteAEditar.idPariente, data);

        notify.success("Actualizado", "Pariente actualizado correctamente.");
      } else {
        await parientesAPI.create(data);

        notify.success("Registrado", "Nuevo pariente guardado.");
      }

      setIsSheetOpen(false);

      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar pariente:", error);

      notify.error("Error", "No se pudo procesar la solicitud.");
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          {
            label: "Personas",
            href: "#",
          },

          {
            label: "Parientes",
          },
        ]}
      />

      <PageHeader
        title="Listado de Parientes"
        buttonLabel="Nuevo Pariente"
        onButtonClick={handleCrearNuevo}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pariente?</AlertDialogTitle>

            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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
          caption="Lista actualizada de parientes."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          headerRow={
            <TableRow>
              <TableHead>Empleado</TableHead>

              <TableHead>Tipo Relación</TableHead>

              <TableHead>Edad</TableHead>

              <TableHead>Fecha Nacimiento</TableHead>

              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {parientes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No hay parientes registrados.
              </TableCell>
            </TableRow>
          ) : (
            parientes.map((p) => (
              <TableRow key={p.idPariente}>
                <TableCell>
                  {p.empleado.nombres} {p.empleado.apellidos}
                </TableCell>

                <TableCell>{p.tipoRelacion}</TableCell>

                <TableCell>{p.edad}</TableCell>

                <TableCell>{p.fechaNacimiento}</TableCell>

                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditar(p)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => {
                      setParienteAEliminar(p);

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
        title={parienteAEditar ? "Editar Pariente" : "Nuevo Pariente"}
        description="Información del núcleo familiar del empleado."
      >
        <ParienteForm
          key={parienteAEditar?.idPariente ?? "nuevo"}
          parienteEditado={parienteAEditar}
          empleados={empleados}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
