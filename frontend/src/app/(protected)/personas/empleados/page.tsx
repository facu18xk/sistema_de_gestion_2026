"use client";

import { useState, useEffect } from "react";
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

import { EmpleadoForm } from "@/components/personas/empleados-form";
import { empleadosAPI } from "@/services/empleadosAPI";
import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { Empleado, EmpleadoSaveDTO, Pais } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function EmpleadosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);

  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const resPaginada = await empleadosAPI.getAll(currentPage, itemsPerPage);
      setEmpleados(resPaginada.items);
      setTotalPages(resPaginada.totalPages);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener la lista de empleados.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cargarPaises = async () => {
    try {
      const res = await ubicacionesAPI.getPaises();
      setPaises(res.items);
    } catch (error) {
      console.error("Error al cargar países:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener la lista de países.",
      );
    }
  };

  useEffect(() => {
    cargarPagina();
  }, [currentPage]);

  useEffect(() => {
    cargarPaises();
  }, []);

  const handleCrearNuevo = () => {
    setEmpleadoAEditar(null);
    setIsSheetOpen(true);
  };

  const handleEditar = (empleado: Empleado) => {
    setEmpleadoAEditar(empleado);
    setIsSheetOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!empleadoAEliminar) return;

    try {
      await empleadosAPI.delete(empleadoAEliminar.idEmpleado);
      notify.success("Eliminado", "El empleado fue eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      notify.error("Error", "No se pudo eliminar el empleado.");
    } finally {
      setIsAlertOpen(false);
      setEmpleadoAEliminar(null);
    }
  };

  const handleFormSubmit = async (data: EmpleadoSaveDTO) => {
    try {
      if (empleadoAEditar) {
        await empleadosAPI.update(empleadoAEditar.idEmpleado, data);
        notify.success("Actualizado", "Empleado actualizado correctamente.");
      } else {
        await empleadosAPI.create(data);
        notify.success("Registrado", "Nuevo empleado guardado.");
      }

      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      notify.error("Error", "No se pudo procesar la solicitud.");
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "RRHH", href: "/dashboard" },
          { label: "Empleados" },
        ]}
      />

      <PageHeader
        title="Listado de Empleados"
        buttonLabel="Nuevo Empleado"
        onButtonClick={handleCrearNuevo}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente a{" "}
              <span className="font-bold text-foreground">
                &quot;{empleadoAEliminar?.nombres} {empleadoAEliminar?.apellidos}&quot;
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Empleado
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
          caption="Lista actualizada de empleados."
          headerRow={
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>CI</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Fecha Ingreso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {empleados.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                No hay empleados registrados.
              </TableCell>
            </TableRow>
          ) : (
            empleados.map((e) => (
              <TableRow key={e.idEmpleado}>
                <TableCell>
                  {e.nombres} {e.apellidos}
                </TableCell>
                <TableCell>{e.ci || "Sin CI"}</TableCell>
                <TableCell>{e.ruc || "Sin RUC"}</TableCell>
                <TableCell>{e.fechaIngreso}</TableCell>

                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditar(e)}
                    className="cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEmpleadoAEliminar(e);
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
        title={empleadoAEditar ? "Editar Empleado" : "Nuevo Empleado"}
        description="Información personal y laboral del empleado."
      >
        <EmpleadoForm
          key={empleadoAEditar?.idEmpleado ?? "nuevo"}
          empleadoEditado={empleadoAEditar}
          paises={paises}
          onRefreshPaises={cargarPaises}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
