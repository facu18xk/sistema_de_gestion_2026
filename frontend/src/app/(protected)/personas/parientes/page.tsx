"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { formatearFecha } from "@/utils/date-utils";
import { Empleado, Pariente, ParienteSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function ParientesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [todosLosParientes, setTodosLosParientes] = useState<Pariente[]>([]);
  const [parienteAEditar, setParienteAEditar] = useState<Pariente | null>(null);
  const [parienteAEliminar, setParienteAEliminar] = useState<Pariente | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const [resParientes, resEmpleados] = await Promise.all([
        parientesAPI.getAll(1, 300),

        empleadosAPI.getAll(1, 999),
      ]);

      setTodosLosParientes(resParientes.items);
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
  }, []);

  const parientesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return todosLosParientes;

    const query = searchTerm.toLowerCase().trim();
    return todosLosParientes.filter((p) => {
      const empleado =
        `${p.empleado?.nombres ?? ""} ${p.empleado?.apellidos ?? ""}`
          .toLowerCase()
          .trim();
      const tipo = (p.tipoRelacion ?? "").toLowerCase();
      const edad = String(p.edad ?? "").toLowerCase();
      const fecha = (p.fechaNacimiento ?? "").toLowerCase();
      return (
        empleado.includes(query) ||
        tipo.includes(query) ||
        edad.includes(query) ||
        fecha.includes(query)
      );
    });
  }, [searchTerm, todosLosParientes]);

  const totalPages = Math.ceil(parientesFiltrados.length / itemsPerPage) || 1;

  const parientesVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return parientesFiltrados.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, itemsPerPage, parientesFiltrados]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            label: "RRHH",
            href: "/personas/empleados",
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

      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado, relación, edad o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm w-full bg-white shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

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
              <TableHead>Nombre</TableHead>

              <TableHead>Apellido</TableHead>

              <TableHead>Tipo Relación</TableHead>

              <TableHead>Edad</TableHead>

              <TableHead>Fecha Nacimiento</TableHead>

              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {parientesVisiblesEnPagina.map((p) => (
            <TableRow key={p.idPariente}>
              <TableCell>{p.empleado.nombres}</TableCell>
              <TableCell> {p.empleado.apellidos}</TableCell>

              <TableCell>{p.tipoRelacion}</TableCell>

              <TableCell>{p.edad}</TableCell>

              <TableCell>{formatearFecha(p.fechaNacimiento)}</TableCell>

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
          ))}

          {parientesVisiblesEnPagina.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-10 text-center text-muted-foreground text-sm"
              >
                {searchTerm.trim()
                  ? "No hay parientes que coincidan con la búsqueda."
                  : "No hay parientes registrados."}
              </TableCell>
            </TableRow>
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
