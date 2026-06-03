"use client";

import { useEffect, useMemo, useState } from "react";
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
import { BancoForm } from "@/components/banco-tesoreria/banco-form";
import { TesoreriaFiltrosListado } from "@/components/banco-tesoreria/tesoreria-filtros-listado";
import { textoCoincide } from "@/lib/list-filters";
import { bancosAPI } from "@/services/bancosAPI";
import { notify } from "@/lib/notifications";
import { Badge } from "@/components/ui/badge";
import type { Banco, BancoSaveDTO } from "@/types/types";

export default function BancosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const [todosLosBancos, setTodosLosBancos] = useState<Banco[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bancoAEditar, setBancoAEditar] = useState<Banco | null>(null);
  const [bancoAEliminar, setBancoAEliminar] = useState<Banco | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const res = await bancosAPI.getAll(1, 500);
      setTodosLosBancos(res.items);
    } catch (error) {
      console.error("Error al cargar bancos:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener el listado de bancos.",
      );
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

  const bancosFiltrados = useMemo(() => {
    return todosLosBancos.filter((b) =>
      textoCoincide(searchTerm, b.nombre, b.activo ? "activo" : "inactivo"),
    );
  }, [todosLosBancos, searchTerm]);

  const totalPages = Math.ceil(bancosFiltrados.length / itemsPerPage) || 1;

  const bancos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return bancosFiltrados.slice(start, start + itemsPerPage);
  }, [bancosFiltrados, currentPage, itemsPerPage]);

  const handleCrearNuevo = () => {
    setBancoAEditar(null);
    setIsSheetOpen(true);
  };

  const handleEditar = (banco: Banco) => {
    setBancoAEditar(banco);
    setIsSheetOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!bancoAEliminar) return;

    try {
      await bancosAPI.delete(bancoAEliminar.idBanco);
      notify.success("Eliminado", "El banco fue eliminado del sistema.");
      await cargarPagina();
    } catch (error) {
      console.error("Error al eliminar banco:", error);
      notify.error("Error", "No se pudo eliminar el banco.");
    } finally {
      setIsAlertOpen(false);
      setBancoAEliminar(null);
    }
  };

  const handleFormSubmit = async (data: BancoSaveDTO) => {
    try {
      if (bancoAEditar) {
        await bancosAPI.update(bancoAEditar.idBanco, data);
        notify.success("Actualizado", "Banco actualizado correctamente.");
      } else {
        await bancosAPI.create(data);
        notify.success("Registrado", "Nuevo banco guardado.");
      }
      setIsSheetOpen(false);
      await cargarPagina();
    } catch (error) {
      console.error("Error al guardar banco:", error);
      notify.error("Error", "No se pudo guardar el banco.");
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Bancos" },
        ]}
      />

      <PageHeader
        title="Listado de bancos"
        buttonLabel="Nuevo banco"
        onButtonClick={handleCrearNuevo}
      />

      <TesoreriaFiltrosListado
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre de banco..."
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar banco?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará{" "}
              <span className="font-semibold text-foreground">
                {bancoAEliminar?.nombre}
              </span>
              . Verifique que no tenga cuentas asociadas.
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
          caption="Bancos registrados en el sistema."
          headerRow={
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {bancos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="h-24 text-center text-muted-foreground"
              >
                No hay bancos registrados.
              </TableCell>
            </TableRow>
          ) : (
            bancos.map((b) => (
              <TableRow key={b.idBanco}>
                <TableCell className="font-medium">{b.nombre}</TableCell>
                <TableCell>
                  <Badge variant={b.activo ? "activo" : "destructive"}>
                    {b.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditar(b)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => {
                      setBancoAEliminar(b);
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
        title={bancoAEditar ? "Editar banco" : "Nuevo banco"}
      >
        <BancoForm
          key={bancoAEditar?.idBanco ?? "nuevo"}
          bancoEditado={bancoAEditar}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
