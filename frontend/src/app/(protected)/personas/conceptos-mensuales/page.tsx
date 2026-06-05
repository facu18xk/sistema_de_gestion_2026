"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, Users, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { empleadosAPI } from "@/services/empleadosAPI";
import { conceptosSalariosAPI } from "@/services/conceptosSalariosAPI";
import { empleadosConceptosMensualesAPI } from "@/services/empleadosConceptosMensualesAPI";
import {
  ConceptoSalario,
  Empleado,
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO,
} from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";
import { formatGuaranies } from "@/utils/money-format";
import { notify } from "@/lib/notifications";

const emptyForm: EmpleadoConceptoMensualSaveDTO = {
  idEmpleado: 0,
  idConceptoSalario: 0,
  monto: 0,
  fechaDesde: "",
  fechaHasta: null,
  activo: true,
};

const emptyBulkForm = {
  idConceptoSalario: "",
  monto: "",
  fechaDesde: "",
  fechaHasta: "",
};

export default function ConceptosMensualesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [items, setItems] = useState<EmpleadoConceptoMensual[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoSalario[]>([]);
  const [editing, setEditing] = useState<EmpleadoConceptoMensual | null>(null);
  const [deleting, setDeleting] = useState<EmpleadoConceptoMensual | null>(null);
  const [formData, setFormData] = useState<EmpleadoConceptoMensualSaveDTO>(emptyForm);
  const [bulkForm, setBulkForm] = useState(emptyBulkForm);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resItems, resEmpleados, resConceptos] = await Promise.all([
        empleadosConceptosMensualesAPI.getAll(1, 100),
        empleadosAPI.getAll(1, 100),
        conceptosSalariosAPI.getAll(1, 100),
      ]);
      setItems(resItems.items);
      setEmpleados(resEmpleados.items);
      setConceptos(resConceptos.items);
    } catch (error) {
      console.error("Error al cargar conceptos mensuales:", error);
      notify.error("Error", "No se pudo obtener la lista de conceptos mensuales.");
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

  const conceptosActivos = useMemo(() => {
    return conceptos.filter((concepto) => concepto.activo);
  }, [conceptos]);

  const filtrados = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.empleado.toLowerCase().includes(query) ||
        item.conceptoSalario.toLowerCase().includes(query) ||
        String(item.monto).includes(query),
    );
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filtrados.length / itemsPerPage) || 1;
  const visibles = filtrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const empleadosBulkFiltrados = useMemo(() => {
    const query = employeeSearch.toLowerCase().trim();
    if (!query) return empleadosOrdenados;

    return empleadosOrdenados.filter((empleado) =>
      `${empleado.nombres} ${empleado.apellidos} ${empleado.ci ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [empleadosOrdenados, employeeSearch]);

  const handleNuevo = () => {
    setEditing(null);
    setFormData(emptyForm);
    setIsSheetOpen(true);
  };

  const handleEditar = (item: EmpleadoConceptoMensual) => {
    setEditing(item);
    setFormData({
      idEmpleadoConceptoMensual: item.idEmpleadoConceptoMensual,
      idEmpleado: item.idEmpleado,
      idConceptoSalario: item.idConceptoSalario,
      monto: item.monto,
      fechaDesde: item.fechaDesde?.substring(0, 10) ?? "",
      fechaHasta: item.fechaHasta?.substring(0, 10) ?? null,
      activo: item.activo,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.idEmpleado || !formData.idConceptoSalario || formData.monto <= 0) {
      notify.warning("Datos incompletos", "Seleccione empleado, concepto y monto válido.");
      return;
    }

    try {
      const payload = {
        ...formData,
        fechaHasta: formData.fechaHasta || null,
      };
      if (editing) {
        await empleadosConceptosMensualesAPI.update(
          editing.idEmpleadoConceptoMensual,
          payload,
        );
        notify.success("Actualizado", "Concepto mensual actualizado correctamente.");
      } else {
        await empleadosConceptosMensualesAPI.create(payload);
        notify.success("Registrado", "Concepto mensual guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar concepto mensual:", error);
      notify.error("Error", "No se pudo guardar el concepto mensual.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!deleting) return;

    try {
      await empleadosConceptosMensualesAPI.delete(deleting.idEmpleadoConceptoMensual);
      notify.success("Eliminado", "Concepto mensual eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar concepto mensual:", error);
      notify.error("Error", "No se pudo eliminar el concepto mensual.");
    } finally {
      setDeleting(null);
      setIsAlertOpen(false);
    }
  };

  const toggleSelectedEmployee = (idEmpleado: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(idEmpleado)
        ? prev.filter((id) => id !== idEmpleado)
        : [...prev, idEmpleado],
    );
  };

  const toggleVisibleEmployees = () => {
    const visibleIds = empleadosBulkFiltrados.map((empleado) => empleado.idEmpleado);
    const allVisibleSelected = visibleIds.every((id) => selectedEmployees.includes(id));

    setSelectedEmployees((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...prev, ...visibleIds])),
    );
  };

  const resetBulk = () => {
    setBulkForm(emptyBulkForm);
    setSelectedEmployees([]);
    setEmployeeSearch("");
  };

  const handleBulkSubmit = async () => {
    const monto = Number(bulkForm.monto);
    const idConceptoSalario = Number(bulkForm.idConceptoSalario);

    if (!idConceptoSalario || !bulkForm.fechaDesde || selectedEmployees.length === 0) {
      notify.warning(
        "Datos incompletos",
        "Seleccione concepto, fecha de inicio y al menos un empleado.",
      );
      return;
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      notify.warning("Monto inválido", "El monto debe ser mayor a cero.");
      return;
    }

    setIsBulkSubmitting(true);
    const results = await Promise.allSettled(
      selectedEmployees.map((idEmpleado) =>
        empleadosConceptosMensualesAPI.create({
          idEmpleado,
          idConceptoSalario,
          monto,
          fechaDesde: bulkForm.fechaDesde,
          fechaHasta: bulkForm.fechaHasta || null,
          activo: true,
        }),
      ),
    );
    const successCount = results.filter((result) => result.status === "fulfilled").length;
    const failCount = results.length - successCount;
    setIsBulkSubmitting(false);

    if (failCount > 0) {
      notify.warning(
        "Asignación parcial",
        `${successCount} asignaciones correctas y ${failCount} con error.`,
      );
    } else {
      notify.success("Asignación completa", `${successCount} empleados actualizados.`);
    }

    setIsBulkOpen(false);
    resetBulk();
    await cargarPagina();
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "RRHH", href: "/personas/empleados" },
          { label: "Conceptos mensuales" },
        ]}
      />
      <PageHeader
        title="Conceptos Mensuales"
        buttonLabel="Nuevo Concepto Mensual"
        onButtonClick={handleNuevo}
        secondaryButtonLabel="Asignación masiva"
        onSecondaryButtonClick={() => setIsBulkOpen(true)}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado, concepto o monto..."
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
            <AlertDialogTitle>¿Eliminar concepto mensual?</AlertDialogTitle>
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
          caption="Lista actualizada de conceptos mensuales."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Hasta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {visibles.map((item) => (
            <TableRow key={item.idEmpleadoConceptoMensual}>
              <TableCell>{item.empleado}</TableCell>
              <TableCell>{item.conceptoSalario}</TableCell>
              <TableCell>{formatGuaranies(item.monto)}</TableCell>
              <TableCell>{formatearFecha(item.fechaDesde)}</TableCell>
              <TableCell>{item.fechaHasta ? formatearFecha(item.fechaHasta) : "Sin fin"}</TableCell>
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
        title={editing ? "Editar concepto mensual" : "Nuevo concepto mensual"}
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
            <Label>Concepto</Label>
            <Select
              value={
                formData.idConceptoSalario
                  ? formData.idConceptoSalario.toString()
                  : ""
              }
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  idConceptoSalario: Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar concepto" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {conceptosActivos.map((concepto) => (
                  <SelectItem
                    key={concepto.idConceptoSalario}
                    value={concepto.idConceptoSalario.toString()}
                  >
                    {concepto.codigo} - {concepto.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              min="0"
              value={formData.monto}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, monto: Number(event.target.value) }))
              }
              required
            />
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

      <Dialog
        open={isBulkOpen}
        onOpenChange={(open) => {
          setIsBulkOpen(open);
          if (!open) resetBulk();
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Asignación masiva</DialogTitle>
            <DialogDescription>
              Asigna un concepto mensual a varios empleados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Concepto</Label>
                <Select
                  value={bulkForm.idConceptoSalario}
                  onValueChange={(value) =>
                    setBulkForm((prev) => ({ ...prev, idConceptoSalario: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar concepto" />
                  </SelectTrigger>
                  <SelectContent>
                    {conceptosActivos.map((concepto) => (
                      <SelectItem
                        key={concepto.idConceptoSalario}
                        value={concepto.idConceptoSalario.toString()}
                      >
                        {concepto.codigo} - {concepto.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulkMonto">Monto</Label>
                <Input
                  id="bulkMonto"
                  type="number"
                  min="0"
                  value={bulkForm.monto}
                  onChange={(event) =>
                    setBulkForm((prev) => ({ ...prev, monto: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bulkDesde">Fecha inicio</Label>
                <Input
                  id="bulkDesde"
                  type="date"
                  value={bulkForm.fechaDesde}
                  onChange={(event) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      fechaDesde: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bulkHasta">Fecha fin</Label>
                <Input
                  id="bulkHasta"
                  type="date"
                  value={bulkForm.fechaHasta}
                  onChange={(event) =>
                    setBulkForm((prev) => ({
                      ...prev,
                      fechaHasta: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="rounded-md border">
              <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empleado..."
                    value={employeeSearch}
                    onChange={(event) => setEmployeeSearch(event.target.value)}
                    className="h-9 pl-9"
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={toggleVisibleEmployees}>
                  <Users className="mr-2 size-4" />
                  Seleccionar visibles
                </Button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {empleadosBulkFiltrados.map((empleado) => (
                  <label
                    key={empleado.idEmpleado}
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                  >
                    <span>
                      {empleado.nombres} {empleado.apellidos}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(empleado.idEmpleado)}
                      onChange={() => toggleSelectedEmployee(empleado.idEmpleado)}
                    />
                  </label>
                ))}
                {empleadosBulkFiltrados.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No hay empleados para el filtro actual.
                  </p>
                )}
              </div>
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {selectedEmployees.length} empleado(s) seleccionado(s)
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBulkSubmit} disabled={isBulkSubmitting}>
              {isBulkSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
