"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  EllipsisVertical,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ContabilidadProcessSelector,
  isProcesoContableHabilitado,
} from "@/components/contabilidad/contabilidad-process-selector";
import { CuentaContableForm } from "@/components/contabilidad/cuenta-contable-form";
import { cuentasContablesAPI } from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import { CuentaContableDTO, ProcesoContableDTO } from "@/types/types";
import { cn } from "@/lib/utils";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (typeof response?.data === "string") return response.data;
    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      return String((response.data as { message?: unknown }).message);
    }
  }

  return "Ocurrió un problema al procesar la solicitud.";
}

const tipoCuentaAccentClasses: Record<string, string> = {
  Activo: "border-l-blue-500",
  Pasivo: "border-l-orange-500",
  Patrimonio: "border-l-purple-500",
  Ingreso: "border-l-green-500",
  Gasto: "border-l-red-500",
};

const tipoCuentaDotClasses: Record<string, string> = {
  Activo: "bg-blue-500",
  Pasivo: "bg-orange-500",
  Patrimonio: "bg-purple-500",
  Ingreso: "bg-green-500",
  Gasto: "bg-red-500",
};

type CuentaTreeRow = CuentaContableDTO & {
  depth: number;
  hasChildren: boolean;
};

function getCuentaCodigo(cuenta: CuentaContableDTO) {
  return cuenta.numeroCuenta ?? cuenta.codigo ?? "";
}

function sortCuentas(a: CuentaContableDTO, b: CuentaContableDTO) {
  return (
    getCuentaCodigo(a).localeCompare(getCuentaCodigo(b), "es", {
      numeric: true,
    }) || a.nombre.localeCompare(b.nombre, "es")
  );
}

function buildCuentaTreeRows(cuentas: CuentaContableDTO[]): CuentaTreeRow[] {
  const childrenByParent = new Map<number | null, CuentaContableDTO[]>();
  const cuentasById = new Map<number, CuentaContableDTO>();
  const rows: CuentaTreeRow[] = [];
  const visited = new Set<number>();

  cuentas.forEach((cuenta) => {
    cuentasById.set(cuenta.idCuentaContable, cuenta);
  });

  cuentas.forEach((cuenta) => {
    const parentId =
      cuenta.idCuentaPadre && cuentasById.has(cuenta.idCuentaPadre)
        ? cuenta.idCuentaPadre
        : null;
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(cuenta);
    childrenByParent.set(parentId, siblings);
  });

  childrenByParent.forEach((siblings) => siblings.sort(sortCuentas));

  const appendRows = (parentId: number | null, depth: number) => {
    const children = childrenByParent.get(parentId) ?? [];

    children.forEach((cuenta) => {
      if (visited.has(cuenta.idCuentaContable)) return;

      visited.add(cuenta.idCuentaContable);
      rows.push({
        ...cuenta,
        depth,
        hasChildren:
          (childrenByParent.get(cuenta.idCuentaContable) ?? []).length > 0,
      });
      appendRows(cuenta.idCuentaContable, depth + 1);
    });
  };

  appendRows(null, 0);

  return rows;
}

function CuentaTreeCell({ cuenta }: { cuenta: CuentaTreeRow }) {
  const isRoot = cuenta.depth === 0;

  return (
    <TableCell className="min-w-[320px]">
      <div
        className="flex h-8 items-center"
        style={{ paddingLeft: `${cuenta.depth * 24}px` }}
      >
        <span className="mr-2 flex w-4 shrink-0 items-center justify-center">
          {cuenta.hasChildren ? (
            <ChevronDown
              className={cn(
                "size-3.5",
                isRoot ? "text-slate-700" : "text-slate-400",
              )}
            />
          ) : !isRoot ? (
            <span className="size-1.5 rounded-full bg-slate-300" />
          ) : (
            <span
              className={cn(
                "size-2 rounded-full",
                tipoCuentaDotClasses[cuenta.tipoCuenta] ?? "bg-slate-500",
              )}
            />
          )}
        </span>

        <span
          className={cn(
            "truncate",
            isRoot
              ? "font-semibold text-slate-950"
              : "font-medium text-slate-800",
          )}
        >
          {cuenta.nombre}
        </span>
      </div>
    </TableCell>
  );
}

function BooleanStatus({ active }: { active: boolean }) {
  if (!active) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <span className="inline-flex size-5 items-center justify-center rounded-full bg-green-50 text-green-700">
      <Check className="size-3.5" />
    </span>
  );
}

export default function PlanCuentasPage() {
  const [proceso, setProceso] = useState<ProcesoContableDTO | null>(null);
  const [cuentas, setCuentas] = useState<CuentaContableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [cuentaAEditar, setCuentaAEditar] = useState<CuentaContableDTO | null>(
    null,
  );
  const [cuentaAEliminar, setCuentaAEliminar] =
    useState<CuentaContableDTO | null>(null);
  const procesoHabilitado = isProcesoContableHabilitado(proceso);
  const cuentasTreeRows = useMemo(
    () => buildCuentaTreeRows(cuentas),
    [cuentas],
  );

  const cargarCuentas = async () => {
    if (!proceso) {
      setCuentas([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await cuentasContablesAPI.getAll(
        1,
        1000,
        proceso.idProcesoContable,
      );
      setCuentas(response.items);
    } catch (error) {
      console.error("Error al cargar cuentas contables:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener el plan de cuentas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, [proceso?.idProcesoContable]);

  const handleCrearNuevo = () => {
    if (!procesoHabilitado) {
      notify.warning(
        "Proceso no habilitado",
        "Solo se pueden modificar cuentas en procesos habilitados.",
      );
      return;
    }

    setCuentaAEditar(null);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<CuentaContableDTO, "idCuentaContable" | "cuentaPadre">,
  ) => {
    if (!procesoHabilitado) {
      notify.warning(
        "Proceso no habilitado",
        "Solo se pueden modificar cuentas en procesos habilitados.",
      );
      return;
    }

    try {
      if (cuentaAEditar) {
        await cuentasContablesAPI.update(cuentaAEditar.idCuentaContable, data);
        notify.success(
          "Cuenta actualizada",
          "La cuenta contable se actualizó correctamente.",
        );
      } else {
        await cuentasContablesAPI.create(data);
        notify.success("Cuenta registrada", "La cuenta contable fue guardada.");
      }

      setIsSheetOpen(false);
      await cargarCuentas();
    } catch (error) {
      console.error("Error al guardar cuenta contable:", error);
      notify.error("Error al guardar", getErrorMessage(error));
    }
  };

  const confirmarEliminacion = async () => {
    if (!cuentaAEliminar) return;
    if (!procesoHabilitado) {
      notify.warning(
        "Proceso no habilitado",
        "Solo se pueden modificar cuentas en procesos habilitados.",
      );
      setIsAlertOpen(false);
      setCuentaAEliminar(null);
      return;
    }

    try {
      await cuentasContablesAPI.delete(cuentaAEliminar.idCuentaContable);
      notify.success("Cuenta eliminada", "La cuenta contable fue removida.");
      await cargarCuentas();
    } catch (error) {
      console.error("Error al eliminar cuenta contable:", error);
      notify.error("Error al eliminar", getErrorMessage(error));
    } finally {
      setIsAlertOpen(false);
      setCuentaAEliminar(null);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Contabilidad", href: "#" },
          { label: "Plan de Cuentas" },
        ]}
      />
      <PageHeader
        title="Plan de Cuentas"
        buttonLabel={proceso && procesoHabilitado ? "Nueva Cuenta" : undefined}
        onButtonClick={
          proceso && procesoHabilitado ? handleCrearNuevo : undefined
        }
      />

      <ContabilidadProcessSelector
        value={proceso?.idProcesoContable}
        onChange={(selected) => {
          setProceso(selected);
        }}
      />

      {proceso && !procesoHabilitado && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          El proceso seleccionado no está habilitado. Las cuentas contables solo
          pueden modificarse en procesos habilitados.
        </div>
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta contable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta{" "}
              <span className="font-bold text-foreground">
                "{cuentaAEliminar?.nombre}"
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
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DataTable
          caption="Cuentas contables del proceso seleccionado."
          headerRow={
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
        >
          {cuentasTreeRows.map((cuenta) => {
            return (
              <TableRow
                key={cuenta.idCuentaContable}
                className={cn(
                  cuenta.depth === 0 &&
                    "border-l-4 bg-slate-50 hover:bg-slate-100",
                  cuenta.depth === 0 &&
                    (tipoCuentaAccentClasses[cuenta.tipoCuenta] ??
                      "border-l-slate-400"),
                )}
              >
                <TableCell
                  className={cn(
                    "font-mono text-sm",
                    cuenta.depth === 0 && "font-semibold",
                  )}
                >
                  {getCuentaCodigo(cuenta)}
                </TableCell>
                <CuentaTreeCell cuenta={cuenta} />
                <TableCell>
                  <BooleanStatus active={cuenta.activa} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={!procesoHabilitado}>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!procesoHabilitado}
                        className="cursor-pointer"
                      >
                        <EllipsisVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      side="left"
                      className="w-36"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setCuentaAEditar(cuenta);
                          setIsSheetOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setCuentaAEliminar(cuenta);
                          setIsAlertOpen(true);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      )}

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={cuentaAEditar ? "Editar Cuenta" : "Nueva Cuenta"}
        description="Información del plan de cuentas."
        contentClassName="sm:max-w-[540px] px-6"
      >
        <CuentaContableForm
          key={
            cuentaAEditar?.idCuentaContable ??
            proceso?.idProcesoContable ??
            "nuevo"
          }
          cuentaEditada={cuentaAEditar}
          proceso={proceso}
          cuentas={cuentas}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsSheetOpen(false)}
        />
      </FormSheet>
    </>
  );
}
