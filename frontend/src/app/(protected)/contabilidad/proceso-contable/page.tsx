"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Loader2, CalendarDays } from "lucide-react";

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

import { Badge } from "@/components/ui/badge";


import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";

import { ProcesoContableForm } from "@/components/contabilidad/proceso-contable-form";
import { procesosContablesAPI } from "@/services/procesosContablesAPI";
import { periodosContablesAPI } from "@/services/periodosContablesAPI";
import { ProcesoContableDTO, ProcesoContableSaveDTO } from "@/types/types";
import { notify } from "@/lib/notifications";

export default function ProcesosContablesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const [procesos, setProcesos] = useState<ProcesoContableDTO[]>([]);

    const [procesoAEditar, setProcesoAEditar] =
        useState<ProcesoContableDTO | null>(null);
    const [procesoAEliminar, setProcesoAEliminar] =
        useState<ProcesoContableDTO | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);

    const cargarPagina = async () => {
        setIsLoading(true);

        try {
            const [resPaginada, periodos] = await Promise.all([
                procesosContablesAPI.getAll(currentPage, itemsPerPage),

                periodosContablesAPI.getAll(1, 9999),
            ]);
            console.log("PERIODOS:", periodos);
            console.log("ITEMS:", periodos.items);
            console.log(Array.isArray(periodos));
            console.log(Array.isArray(periodos.items));
            const procesosConPeriodos = resPaginada.items.map(
                (proceso: ProcesoContableDTO) => ({
                    ...proceso,

                    tienePeriodos: periodos.items.some(
                        (periodo: any) =>
                            periodo.idProcesoContable === proceso.idProcesoContable,
                    ),
                }),
            );

            setProcesos(procesosConPeriodos);
            setTotalPages(resPaginada.totalPages);
        } catch (error) {
            console.error("Error al cargar procesos contables:", error);
            notify.error(
                "Error de conexión",
                "No se pudo obtener la lista de procesos contables.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarPagina();
    }, [currentPage]);

    const handleCrearNuevo = () => {
        setProcesoAEditar(null);
        setIsSheetOpen(true);
    };

    const handleEditar = (proceso: ProcesoContableDTO) => {
        setProcesoAEditar(proceso);
        setIsSheetOpen(true);
    };

    const confirmarEliminacion = async () => {
        if (!procesoAEliminar) return;

        try {
            await procesosContablesAPI.delete(procesoAEliminar.idProcesoContable);

            notify.success(
                "Eliminado",
                "El proceso contable fue eliminado correctamente.",
            );

            await cargarPagina();
        } catch (error) {
            console.error("Error al eliminar proceso contable:", error);
            notify.error(
                "Error al eliminar",
                "No se pudo eliminar el proceso contable.",
            );
        } finally {
            setIsAlertOpen(false);
            setProcesoAEliminar(null);
        }
    };

    const handleFormSubmit = async (data: ProcesoContableSaveDTO) => {
        try {
            if (procesoAEditar) {
                await procesosContablesAPI.update(
                    procesoAEditar.idProcesoContable,
                    data,
                );
                notify.success(
                    "Actualizado",
                    "Proceso Contable actualizado correctamente.",
                );
            } else {
                await procesosContablesAPI.create(data);
                notify.success("Registrado", "Nuevo Proceso Contable guardado.");
            }

            setIsSheetOpen(false);
            await cargarPagina();
        } catch (error) {
            console.error("Error al guardar Proceso Contable:", error);
            notify.error("Error", "No se pudo procesar la solicitud.");
        }
    };

    const generarPeriodos = async (id: number) => {
        try {
            await procesosContablesAPI.generarPeriodos(id);

            setProcesos((prev) =>
                prev.map((p) =>
                    p.idProcesoContable === id
                        ? {
                            ...p,
                            tienePeriodos: true,
                        }
                        : p,
                ),
            );
            notify.success(
                "Períodos generados",
                "Los períodos contables fueron generados correctamente.",
            );
        } catch (error) {
            console.error(error);

            notify.error("Error", "No se pudieron generar los períodos.");
        }
    };

    return (
        <>
            <PageBreadcrumb
                steps={[
                    { label: "Contabilidad", href: "#" },
                    { label: "Procesos Contables" },
                ]}
            />

            <PageHeader
                title="Listado de Procesos Contables"
                buttonLabel="Nuevo Proceso Contable"
                onButtonClick={handleCrearNuevo}
            />

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Eliminarás permanentemente el
                            proceso contable{" "}
                            <span className="font-bold text-foreground">
                                "{procesoAEliminar ? procesoAEliminar.descripcion : ""}"
                            </span>{" "}
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmarEliminacion}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar Proceso
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
                    caption="Lista de procesos contables."
                    headerRow={
                        <TableRow>
                            <TableHead>Año</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Moneda</TableHead>
                            <TableHead>Niveles</TableHead>
                            <TableHead>Dígitos/Nivel</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    }
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                >
                    {procesos.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No hay Procesos Contables registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        procesos.map((p) => (
                            <TableRow key={p.idProcesoContable}>
                                <TableCell>{p.periodoAnho}</TableCell>
                                <TableCell>{p.descripcion}</TableCell>
                                <TableCell>{p.moneda}</TableCell>
                                <TableCell>{p.cantNiveles}</TableCell>
                                <TableCell>{p.cantDigitosNivel}</TableCell>
                                <TableCell>
                                    {p.estado === "Habilitado" ? (
                                        <Badge variant="habilitado">{p.estado}</Badge>
                                    ) : (
                                        <Badge variant="destructive">{p.estado}</Badge>
                                    )}
                                </TableCell>

                                <TableCell className="text-right space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditar(p)}
                                        className="cursor-pointer"
                                    >
                                        <Pencil className="size-3.5" />
                                    </Button>

                                    {!p.tienePeriodos && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => generarPeriodos(p.idProcesoContable)}
                                            className="cursor-pointer"
                                        >
                                            <CalendarDays className="size-3.5 text-blue-600" />
                                        </Button>
                                    )}

                                    {p.estado !== "Cerrado" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setProcesoAEliminar(p);
                                                setIsAlertOpen(true);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5 text-destructive" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </DataTable>
            )}
            <FormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                title={
                    procesoAEditar ? "Editar Proceso Contable" : "Nuevo Proceso Contable"
                }
                description="Información del Proceso Contable."
            >
                <ProcesoContableForm
                    key={procesoAEditar?.idProcesoContable ?? "nuevo"}
                    procesoEditado={procesoAEditar}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsSheetOpen(false)}
                />
            </FormSheet>
        </>
    );
}
