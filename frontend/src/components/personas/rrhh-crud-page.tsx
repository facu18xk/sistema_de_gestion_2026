"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Search, Trash2, X } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { PaginatedResponse } from "@/types/types";
import { notify } from "@/lib/notifications";
import { getBusinessErrorMessage } from "@/services/rrhhAPI";

type CrudApi<T, TSave> = {
  getAll: (page?: number, pageSize?: number) => Promise<PaginatedResponse<T>>;
  create: (data: TSave) => Promise<T>;
  update: (id: number, data: TSave) => Promise<T>;
  delete: (id: number) => Promise<T>;
};

type Column<T> = {
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
};

export function RrhhCrudPage<T, TSave>({
  title,
  description,
  buttonLabel,
  caption,
  searchPlaceholder,
  emptyText,
  emptySearchText,
  sheetTitle,
  sheetDescription,
  deleteTitle,
  deleteDescription,
  api,
  getId,
  getSearchText,
  columns,
  renderForm,
  loadDependencies,
  onDependenciesLoaded,
  reloadKey,
}: {
  title: string;
  description?: string;
  buttonLabel: string;
  caption: string;
  searchPlaceholder: string;
  emptyText: string;
  emptySearchText: string;
  sheetTitle: (item: T | null) => string;
  sheetDescription: string;
  deleteTitle: string;
  deleteDescription: (item: T) => React.ReactNode;
  api: CrudApi<T, TSave>;
  getId: (item: T) => number;
  getSearchText: (item: T) => string;
  columns: Column<T>[];
  renderForm: (props: {
    item: T | null;
    onSubmit: (data: TSave) => Promise<void>;
    onCancel: () => void;
  }) => React.ReactNode;
  loadDependencies?: () => Promise<void>;
  onDependenciesLoaded?: () => void;
  reloadKey?: string | number;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [itemAEditar, setItemAEditar] = useState<T | null>(null);
  const [itemAEliminar, setItemAEliminar] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      if (loadDependencies) {
        await loadDependencies();
        onDependenciesLoaded?.();
      }
      const response = await api.getAll(1, 500);
      setItems(response.items);
    } catch (error) {
      console.error("Error al cargar RRHH:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const itemsFiltrados = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(query),
    );
  }, [getSearchText, items, searchTerm]);

  const totalPages = Math.ceil(itemsFiltrados.length / itemsPerPage) || 1;

  const itemsVisibles = useMemo(() => {
    const from = (currentPage - 1) * itemsPerPage;
    return itemsFiltrados.slice(from, from + itemsPerPage);
  }, [currentPage, itemsFiltrados]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (data: TSave) => {
    try {
      if (itemAEditar) {
        await api.update(getId(itemAEditar), data);
        notify.success("Actualizado", "Registro actualizado correctamente.");
      } else {
        await api.create(data);
        notify.success("Registrado", "Registro guardado correctamente.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar RRHH:", error);
      notify.error("Error", getBusinessErrorMessage(error));
      throw error;
    }
  };

  const confirmarEliminacion = async () => {
    if (!itemAEliminar) return;

    try {
      await api.delete(getId(itemAEliminar));
      notify.success("Eliminado", "Registro eliminado correctamente.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar RRHH:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setItemAEliminar(null);
      setIsAlertOpen(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[{ label: "RRHH", href: "/dashboard" }, { label: title }]}
      />

      <PageHeader
        title={title}
        description={description}
        buttonLabel={buttonLabel}
        onButtonClick={() => {
          setItemAEditar(null);
          setIsSheetOpen(true);
        }}
      />

      <div className="my-4 flex max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full bg-white pl-9 pr-9 text-sm shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 size-7 hover:bg-transparent"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {itemAEliminar && deleteDescription(itemAEliminar)}
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
          caption={caption}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          headerRow={
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {itemsVisibles.map((item) => (
            <TableRow key={getId(item)}>
              {columns.map((column) => (
                <TableCell key={column.header} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
              <TableCell className="space-x-1 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setItemAEditar(item);
                    setIsSheetOpen(true);
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setItemAEliminar(item);
                    setIsAlertOpen(true);
                  }}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {itemsVisibles.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {searchTerm.trim() ? emptySearchText : emptyText}
              </TableCell>
            </TableRow>
          )}
        </DataTable>
      )}

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={sheetTitle(itemAEditar)}
        description={sheetDescription}
      >
        {renderForm({
          item: itemAEditar,
          onSubmit: handleSubmit,
          onCancel: () => setIsSheetOpen(false),
        })}
      </FormSheet>
    </>
  );
}
