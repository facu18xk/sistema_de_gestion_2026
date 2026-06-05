"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { parametrosSalariosAPI } from "@/services/parametrosSalariosAPI";
import { ParametroSalario, ParametroSalarioSaveDTO } from "@/types/types";
import { formatGuaranies } from "@/utils/money-format";
import { formatearFecha } from "@/utils/date-utils";
import { notify } from "@/lib/notifications";

const emptyForm: ParametroSalarioSaveDTO = {
  fechaDesde: "",
  fechaHasta: null,
  salarioMinimo: 0,
  porcentajeIpsEmpleado: 9,
  porcentajeBonificacionFamiliar: 5,
  activo: true,
};

export default function ParametrosSalarialesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [items, setItems] = useState<ParametroSalario[]>([]);
  const [editing, setEditing] = useState<ParametroSalario | null>(null);
  const [deleting, setDeleting] = useState<ParametroSalario | null>(null);
  const [formData, setFormData] = useState<ParametroSalarioSaveDTO>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await parametrosSalariosAPI.getAll(1, 100);
      setItems(res.items);
    } catch (error) {
      console.error("Error al cargar parámetros:", error);
      notify.error("Error", "No se pudo obtener la lista de parámetros salariales.");
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

  const filtrados = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.fechaDesde.toLowerCase().includes(query) ||
        (item.fechaHasta ?? "").toLowerCase().includes(query) ||
        String(item.salarioMinimo).includes(query),
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

  const handleEditar = (item: ParametroSalario) => {
    setEditing(item);
    setFormData({
      idParametroSalario: item.idParametroSalario,
      fechaDesde: item.fechaDesde?.substring(0, 10) ?? "",
      fechaHasta: item.fechaHasta?.substring(0, 10) ?? null,
      salarioMinimo: item.salarioMinimo,
      porcentajeIpsEmpleado: item.porcentajeIpsEmpleado,
      porcentajeBonificacionFamiliar: item.porcentajeBonificacionFamiliar,
      activo: item.activo,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formData.salarioMinimo <= 0) {
      notify.warning("Datos incompletos", "El salario mínimo debe ser mayor a cero.");
      return;
    }

    try {
      const payload = {
        ...formData,
        fechaHasta: formData.fechaHasta || null,
      };
      if (editing) {
        await parametrosSalariosAPI.update(editing.idParametroSalario, payload);
        notify.success("Actualizado", "Parámetro actualizado correctamente.");
      } else {
        await parametrosSalariosAPI.create(payload);
        notify.success("Registrado", "Parámetro guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar parámetro:", error);
      notify.error("Error", "No se pudo guardar el parámetro salarial.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!deleting) return;

    try {
      await parametrosSalariosAPI.delete(deleting.idParametroSalario);
      notify.success("Eliminado", "Parámetro eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar parámetro:", error);
      notify.error("Error", "No se pudo eliminar el parámetro salarial.");
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
          { label: "Parámetros salariales" },
        ]}
      />
      <PageHeader
        title="Parámetros Salariales"
        buttonLabel="Nuevo Parámetro"
        onButtonClick={handleNuevo}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por fecha o salario..."
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
            <AlertDialogTitle>¿Eliminar parámetro?</AlertDialogTitle>
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
          caption="Lista actualizada de parámetros salariales."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              <TableHead>Desde</TableHead>
              <TableHead>Hasta</TableHead>
              <TableHead>Salario mínimo</TableHead>
              <TableHead>IPS empleado</TableHead>
              <TableHead>Bonificación familiar</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {visibles.map((item) => (
            <TableRow key={item.idParametroSalario}>
              <TableCell>{formatearFecha(item.fechaDesde)}</TableCell>
              <TableCell>{item.fechaHasta ? formatearFecha(item.fechaHasta) : "Sin fin"}</TableCell>
              <TableCell>{formatGuaranies(item.salarioMinimo)}</TableCell>
              <TableCell>{item.porcentajeIpsEmpleado}%</TableCell>
              <TableCell>{item.porcentajeBonificacionFamiliar}%</TableCell>
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
        title={editing ? "Editar parámetro" : "Nuevo parámetro"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 px-2 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fechaDesde">Fecha desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={formData.fechaDesde}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, fechaDesde: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaHasta">Fecha hasta</Label>
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
          <div className="grid gap-2">
            <Label htmlFor="salarioMinimo">Salario mínimo</Label>
            <Input
              id="salarioMinimo"
              type="number"
              min="0"
              value={formData.salarioMinimo}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  salarioMinimo: Number(event.target.value),
                }))
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ips">IPS empleado (%)</Label>
              <Input
                id="ips"
                type="number"
                min="0"
                step="0.01"
                value={formData.porcentajeIpsEmpleado}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    porcentajeIpsEmpleado: Number(event.target.value),
                  }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bonificacion">Bonificación (%)</Label>
              <Input
                id="bonificacion"
                type="number"
                min="0"
                step="0.01"
                value={formData.porcentajeBonificacionFamiliar}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    porcentajeBonificacionFamiliar: Number(event.target.value),
                  }))
                }
                required
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
