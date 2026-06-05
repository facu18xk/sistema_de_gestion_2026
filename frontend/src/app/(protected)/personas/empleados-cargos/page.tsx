"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { FormSheet } from "@/components/shared/form-sheet";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { cargosAPI } from "@/services/cargosAPI";
import { empleadosAPI } from "@/services/empleadosAPI";
import { empleadosCargosAPI } from "@/services/empleadosCargosAPI";
import { Cargo, Empleado, EmpleadoCargo, EmpleadoCargoSaveDTO } from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";
import { notify } from "@/lib/notifications";

const emptyForm: EmpleadoCargoSaveDTO = {
  idEmpleado: 0,
  idCargo: 0,
  fechaDesde: "",
  fechaHasta: null,
  activo: true,
};

export default function EmpleadosCargosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [items, setItems] = useState<EmpleadoCargo[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [editing, setEditing] = useState<EmpleadoCargo | null>(null);
  const [deleting, setDeleting] = useState<EmpleadoCargo | null>(null);
  const [formData, setFormData] = useState<EmpleadoCargoSaveDTO>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resItems, resEmpleados, resCargos] = await Promise.all([
        empleadosCargosAPI.getAll(1, 100),
        empleadosAPI.getAll(1, 100),
        cargosAPI.getAll(1, 100),
      ]);
      setItems(resItems.items);
      setEmpleados(resEmpleados.items);
      setCargos(resCargos.items);
    } catch (error) {
      console.error("Error al cargar cargos de empleados:", error);
      notify.error("Error", "No se pudo obtener la lista de cargos de empleados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const empleadosOrdenados = useMemo(() => {
    return [...empleados].sort((a, b) =>
      `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`),
    );
  }, [empleados]);

  const cargosActivos = useMemo(() => {
    return cargos.filter((cargo) => cargo.activo);
  }, [cargos]);

  const filtrados = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.empleado.toLowerCase().includes(query) ||
        item.cargo.toLowerCase().includes(query) ||
        item.fechaDesde.toLowerCase().includes(query) ||
        (item.fechaHasta ?? "").toLowerCase().includes(query),
    );
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filtrados.length / itemsPerPage) || 1;
  const visibles = filtrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNuevo = () => {
    setEditing(null);
    setFormData(emptyForm);
    setIsSheetOpen(true);
  };

  const handleEditar = (item: EmpleadoCargo) => {
    setEditing(item);
    setFormData({
      idEmpleadoCargo: item.idEmpleadoCargo,
      idEmpleado: item.idEmpleado,
      idCargo: item.idCargo,
      fechaDesde: item.fechaDesde?.substring(0, 10) ?? "",
      fechaHasta: item.fechaHasta?.substring(0, 10) ?? null,
      activo: item.activo,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.idEmpleado || !formData.idCargo || !formData.fechaDesde) {
      notify.warning("Datos incompletos", "Seleccione empleado, cargo y fecha desde.");
      return;
    }

    try {
      const payload = {
        ...formData,
        fechaHasta: formData.fechaHasta || null,
      };
      if (editing) {
        await empleadosCargosAPI.update(editing.idEmpleadoCargo, payload);
        notify.success("Actualizado", "Cargo de empleado actualizado correctamente.");
      } else {
        await empleadosCargosAPI.create(payload);
        notify.success("Registrado", "Cargo de empleado guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar cargo de empleado:", error);
      notify.error("Error", "No se pudo guardar el cargo de empleado.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!deleting) return;

    try {
      await empleadosCargosAPI.delete(deleting.idEmpleadoCargo);
      notify.success("Eliminado", "Cargo de empleado eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar cargo de empleado:", error);
      notify.error("Error", "No se pudo eliminar el cargo de empleado.");
    } finally {
      setDeleting(null);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "RRHH", href: "/personas/empleados" },
          { label: "Cargos de empleados" },
        ]}
      />
      <PageHeader
        title="Cargos de Empleados"
        buttonLabel="Nuevo Cargo de Empleado"
        onButtonClick={handleNuevo}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado, cargo o fecha..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full bg-white pl-9 pr-9 text-sm shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cargo de empleado?</AlertDialogTitle>
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
          caption="Historial de cargos de empleados."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Hasta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {visibles.map((item) => (
            <TableRow key={item.idEmpleadoCargo}>
              <TableCell>{item.empleado}</TableCell>
              <TableCell>{item.cargo}</TableCell>
              <TableCell>{formatearFecha(item.fechaDesde)}</TableCell>
              <TableCell>{item.fechaHasta ? formatearFecha(item.fechaHasta) : "Actual"}</TableCell>
              <TableCell>
                <Badge variant={item.activo ? "activo" : "secondary"}>
                  {item.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEditar(item)}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeleting(item);
                    setIsAlertOpen(true);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={editing ? "Editar cargo de empleado" : "Nuevo cargo de empleado"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 px-2 py-4 text-sm">
          <div className="grid gap-2">
            <Label>Empleado</Label>
            <Select
              value={formData.idEmpleado ? formData.idEmpleado.toString() : ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, idEmpleado: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {empleadosOrdenados.map((empleado) => (
                  <SelectItem
                    key={empleado.idEmpleado}
                    value={empleado.idEmpleado.toString()}
                  >
                    {empleado.nombres} {empleado.apellidos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Cargo</Label>
            <Select
              value={formData.idCargo ? formData.idCargo.toString() : ""}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, idCargo: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cargo" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {cargosActivos.map((cargo) => (
                  <SelectItem key={cargo.idCargo} value={cargo.idCargo.toString()}>
                    {cargo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fechaDesde">Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={formData.fechaDesde}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    fechaDesde: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaHasta">Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={formData.fechaHasta ?? ""}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    fechaHasta: event.target.value || null,
                  }))
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, activo: event.target.checked }))
              }
            />
            Activo
          </label>
          <div className="mt-4 flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? "Actualizar" : "Guardar"}</Button>
          </div>
        </form>
      </FormSheet>
    </>
  );
}
