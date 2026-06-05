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
import { conceptosSalariosAPI } from "@/services/conceptosSalariosAPI";
import { ConceptoSalario, ConceptoSalarioSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

const emptyForm: ConceptoSalarioSaveDTO = {
  codigo: "",
  descripcion: "",
  tipo: "Ingreso",
  deducibleIps: false,
  esSalarioBase: false,
  esIps: false,
  esBonificacionFamiliar: false,
  activo: true,
};

export default function ConceptosSalarialesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [items, setItems] = useState<ConceptoSalario[]>([]);
  const [editing, setEditing] = useState<ConceptoSalario | null>(null);
  const [deleting, setDeleting] = useState<ConceptoSalario | null>(null);
  const [formData, setFormData] = useState<ConceptoSalarioSaveDTO>(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await conceptosSalariosAPI.getAll(1, 100);
      setItems(res.items);
    } catch (error) {
      console.error("Error al cargar conceptos:", error);
      notify.error("Error", "No se pudo obtener la lista de conceptos salariales.");
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
        item.codigo.toLowerCase().includes(query) ||
        item.descripcion.toLowerCase().includes(query) ||
        item.tipo.toLowerCase().includes(query),
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

  const handleEditar = (item: ConceptoSalario) => {
    setEditing(item);
    setFormData({
      idConceptoSalario: item.idConceptoSalario,
      codigo: item.codigo,
      descripcion: item.descripcion,
      tipo: item.tipo,
      deducibleIps: item.deducibleIps,
      esSalarioBase: item.esSalarioBase,
      esIps: item.esIps,
      esBonificacionFamiliar: item.esBonificacionFamiliar,
      activo: item.activo,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        ...formData,
        codigo: formData.codigo.trim().toUpperCase(),
        descripcion: formData.descripcion.trim(),
      };
      if (editing) {
        await conceptosSalariosAPI.update(editing.idConceptoSalario, payload);
        notify.success("Actualizado", "Concepto actualizado correctamente.");
      } else {
        await conceptosSalariosAPI.create(payload);
        notify.success("Registrado", "Concepto guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar concepto:", error);
      notify.error("Error", "No se pudo guardar el concepto salarial.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!deleting) return;

    try {
      await conceptosSalariosAPI.delete(deleting.idConceptoSalario);
      notify.success("Eliminado", "Concepto eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar concepto:", error);
      notify.error("Error", "No se pudo eliminar el concepto salarial.");
    } finally {
      setDeleting(null);
      setIsAlertOpen(false);
    }
  };

  const updateFlag = (key: keyof ConceptoSalarioSaveDTO, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "RRHH", href: "/personas/empleados" },
          { label: "Conceptos salariales" },
        ]}
      />
      <PageHeader
        title="Conceptos Salariales"
        buttonLabel="Nuevo Concepto"
        onButtonClick={handleNuevo}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descripción o tipo..."
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
            <AlertDialogTitle>¿Eliminar concepto?</AlertDialogTitle>
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
          caption="Lista actualizada de conceptos salariales."
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marcas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {visibles.map((item) => (
            <TableRow key={item.idConceptoSalario}>
              <TableCell className="font-medium">{item.codigo}</TableCell>
              <TableCell>{item.descripcion}</TableCell>
              <TableCell>
                <Badge variant={item.tipo === "Egreso" ? "destructive" : "secondary"}>
                  {item.tipo}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {item.deducibleIps && <Badge variant="outline">IPS</Badge>}
                  {item.esSalarioBase && <Badge variant="outline">Base</Badge>}
                  {item.esIps && <Badge variant="outline">Concepto IPS</Badge>}
                  {item.esBonificacionFamiliar && (
                    <Badge variant="outline">Bonificación</Badge>
                  )}
                </div>
              </TableCell>
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
        title={editing ? "Editar concepto" : "Nuevo concepto"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4 px-2 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, codigo: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                  <SelectItem value="Egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, descripcion: event.target.value }))
              }
              required
            />
          </div>
          <div className="grid gap-2 rounded-md border p-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.deducibleIps}
                onChange={(event) => updateFlag("deducibleIps", event.target.checked)}
              />
              Deducible IPS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.esSalarioBase}
                onChange={(event) => updateFlag("esSalarioBase", event.target.checked)}
              />
              Es salario base
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.esIps}
                onChange={(event) => updateFlag("esIps", event.target.checked)}
              />
              Es concepto IPS
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.esBonificacionFamiliar}
                onChange={(event) =>
                  updateFlag("esBonificacionFamiliar", event.target.checked)
                }
              />
              Es bonificación familiar
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(event) => updateFlag("activo", event.target.checked)}
              />
              Activo
            </label>
          </div>
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
