"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { cargosAPI } from "@/services/cargosAPI";
import { Cargo, CargoSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

const emptyForm: CargoSaveDTO = {
  nombre: "",
  descripcion: "",
  activo: true,
};

export default function CargosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [items, setItems] = useState<Cargo[]>([]);
  const [editing, setEditing] = useState<Cargo | null>(null);
  const [deleting, setDeleting] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState<CargoSaveDTO>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await cargosAPI.getAll(1, 100);
      setItems(res.items);
    } catch (error) {
      console.error("Error al cargar cargos:", error);
      notify.error("Error", "No se pudo obtener la lista de cargos.");
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
        item.nombre.toLowerCase().includes(query) ||
        (item.descripcion ?? "").toLowerCase().includes(query),
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

  const handleEditar = (cargo: Cargo) => {
    setEditing(cargo);
    setFormData({
      idCargo: cargo.idCargo,
      nombre: cargo.nombre,
      descripcion: cargo.descripcion ?? "",
      activo: cargo.activo,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        descripcion: formData.descripcion?.trim() || null,
      };
      if (editing) {
        await cargosAPI.update(editing.idCargo, payload);
        notify.success("Actualizado", "Cargo actualizado correctamente.");
      } else {
        await cargosAPI.create(payload);
        notify.success("Registrado", "Cargo guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar cargo:", error);
      notify.error("Error", "No se pudo guardar el cargo.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!deleting) return;

    try {
      await cargosAPI.delete(deleting.idCargo);
      notify.success("Eliminado", "Cargo eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar cargo:", error);
      notify.error("Error", "No se pudo eliminar el cargo.");
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
          { label: "Cargos" },
        ]}
      />

      <PageHeader
        title="Listado de Cargos"
        buttonLabel="Nuevo Cargo"
        onButtonClick={handleNuevo}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o descripción..."
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
            <AlertDialogTitle>¿Eliminar cargo?</AlertDialogTitle>
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
          caption="Lista actualizada de cargos."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {visibles.map((item) => (
            <TableRow key={item.idCargo}>
              <TableCell className="font-medium">{item.nombre}</TableCell>
              <TableCell>{item.descripcion || "Sin descripción"}</TableCell>
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
        title={editing ? "Editar cargo" : "Nuevo cargo"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 px-2 py-4 text-sm">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, nombre: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion ?? ""}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  descripcion: event.target.value,
                }))
              }
            />
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
