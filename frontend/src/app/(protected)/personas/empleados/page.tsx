"use client";

import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { formatearFecha } from "@/utils/date-utils";
import { EmpleadoForm } from "@/components/personas/empleados-form";
import { empleadosAPI } from "@/services/empleadosAPI";
import { ubicacionesAPI } from "@/services/ubicacionesAPI";
import { Empleado, EmpleadoSaveDTO, Pais } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function EmpleadosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [todosLosEmpleados, setTodosLosEmpleados] = useState<Empleado[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);

  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);

    try {
      const resPaginada = await empleadosAPI.getAll(1, 300);
      setTodosLosEmpleados(resPaginada.items);
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
    cargarPaises();
  }, []);

  const empleadosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return todosLosEmpleados;

    const query = searchTerm.toLowerCase().trim();
    return todosLosEmpleados.filter(
      (e) =>
        e.nombres.toLowerCase().includes(query) ||
        e.apellidos.toLowerCase().includes(query) ||
        (e.ci && formatCI(e.ci).toLowerCase().includes(query)) ||
        (e.ruc && formatRUC(e.ruc).toLowerCase().includes(query)),
    );
  }, [searchTerm, todosLosEmpleados]);

  const totalPages = Math.ceil(empleadosFiltrados.length / itemsPerPage) || 1;

  const empleadosVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return empleadosFiltrados.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, empleadosFiltrados, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        steps={[{ label: "RRHH", href: "/dashboard" }, { label: "Empleados" }]}
      />

      <PageHeader
        title="Listado de Empleados"
        buttonLabel="Nuevo Empleado"
        onButtonClick={handleCrearNuevo}
      />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o CI/RUC..."
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
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente a{" "}
              <span className="font-bold text-foreground">
                &quot;{empleadoAEliminar?.nombres}{" "}
                {empleadoAEliminar?.apellidos}&quot;
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
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
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
          {empleadosVisiblesEnPagina.map((e) => (
            <TableRow key={e.idEmpleado}>
              <TableCell>{e.nombres}</TableCell>
              <TableCell>{e.apellidos}</TableCell>
              <TableCell>{formatCI(e.ci) || "Sin CI"}</TableCell>
              <TableCell>{formatRUC(e.ruc) || "Sin RUC"}</TableCell>
              <TableCell>{formatearFecha(e.fechaIngreso)}</TableCell>

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
          ))}
          {empleadosVisiblesEnPagina.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground text-sm"
              >
                {searchTerm.trim()
                  ? "No hay empleados que coincidan con la búsqueda."
                  : "No hay empleados registrados."}
              </TableCell>
            </TableRow>
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
