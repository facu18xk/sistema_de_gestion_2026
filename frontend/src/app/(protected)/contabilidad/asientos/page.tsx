"use client";

import { useCallback, useEffect, useState } from "react";
import { EllipsisVertical, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { asientosAPI, asientosDetallesAPI } from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import { AsientoDTO, AsientoDetalleDTO } from "@/types/types";

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PY").format(new Date(value));
}

function money(value: number) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(value);
}

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

  return "No se pudo completar la operación.";
}

export default function AsientosPage() {
  const router = useRouter();
  const [asientos, setAsientos] = useState<AsientoDTO[]>([]);
  const [asientoSeleccionado, setAsientoSeleccionado] =
    useState<AsientoDTO | null>(null);
  const [asientoAEliminar, setAsientoAEliminar] = useState<AsientoDTO | null>(
    null,
  );
  const [detallesAsiento, setDetallesAsiento] = useState<AsientoDetalleDTO[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetalles, setIsLoadingDetalles] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarAsientos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await asientosAPI.getAll(currentPage, itemsPerPage);
      setAsientos(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error al cargar asientos:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener la lista de asientos.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const cargarDetalles = async (asiento: AsientoDTO) => {
    setAsientoSeleccionado(asiento);
    setIsDetailOpen(true);
    setIsLoadingDetalles(true);
    try {
      const response = await asientosDetallesAPI.getAll(1, 1000);
      setDetallesAsiento(
        response.items
          .filter((detalle) => detalle.idAsiento === asiento.idAsiento)
          .sort((a, b) => a.item - b.item),
      );
    } catch (error) {
      console.error("Error al cargar detalles del asiento:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener el detalle del asiento.",
      );
    } finally {
      setIsLoadingDetalles(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!asientoAEliminar) return;

    setIsDeleting(true);
    try {
      await asientosAPI.delete(asientoAEliminar.idAsiento);
      notify.success(
        "Asiento eliminado",
        "El asiento contable fue eliminado correctamente.",
      );
      setIsAlertOpen(false);
      setAsientoAEliminar(null);
      cargarAsientos();
    } catch (error) {
      console.error("Error al eliminar asiento:", error);
      notify.error("Error al eliminar", getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    cargarAsientos();
  }, [cargarAsientos]);

  return (
    <>
      <PageBreadcrumb
        steps={[{ label: "Contabilidad", href: "#" }, { label: "Asientos" }]}
      />
      <PageHeader
        title="Asientos Contables"
        buttonLabel="Nuevo Asiento"
        onButtonClick={() => router.push("/contabilidad/asientos/nuevo")}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar asiento contable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el asiento{" "}
              {asientoAEliminar?.numeroAsiento ?? ""}. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                confirmarEliminar();
              }}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
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
          caption="Listado de asientos contables."
          headerRow={
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Automático</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        >
          {asientos.map((asiento) => (
            <TableRow key={asiento.idAsiento}>
              <TableCell className="font-mono">
                {asiento.numeroAsiento}
              </TableCell>
              <TableCell>{formatDate(asiento.fecha)}</TableCell>
              <TableCell>
                {asiento.periodoContable ?? asiento.idPeriodoContable ?? "-"}
              </TableCell>
              <TableCell className="max-w-[360px] truncate">
                {asiento.descripcion ?? "-"}
              </TableCell>
              <TableCell>{asiento.estado}</TableCell>
              <TableCell>{asiento.automatico ? "Sí" : "No"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      aria-label={`Acciones del asiento ${asiento.numeroAsiento}`}
                    >
                      <EllipsisVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="left"
                    className="w-36"
                  >
                    <DropdownMenuItem onClick={() => cargarDetalles(asiento)}>
                      <Eye className="size-3.5" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={asiento.automatico}
                      onClick={() =>
                        router.push(
                          `/contabilidad/asientos/${asiento.idAsiento}/editar`,
                        )
                      }
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setAsientoAEliminar(asiento);
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
          ))}
        </DataTable>
      )}

      <FormSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        title={
          asientoSeleccionado
            ? `Asiento ${asientoSeleccionado.numeroAsiento}`
            : "Detalle de Asiento"
        }
        description="Líneas contables del asiento."
        contentClassName="px-6 sm:max-w-[900px] sm:min-w-[760px]"
      >
        <div className="space-y-4 py-4">
          {asientoSeleccionado && (
            <div className="grid gap-3 text-sm md:grid-cols-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Fecha
                </div>
                <div>{formatDate(asientoSeleccionado.fecha)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Periodo
                </div>
                <div>
                  {asientoSeleccionado.periodoContable ??
                    asientoSeleccionado.idPeriodoContable ??
                    "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Estado
                </div>
                <Badge variant="outline">{asientoSeleccionado.estado}</Badge>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Origen
                </div>
                <div>{asientoSeleccionado.modulo ?? "Manual"}</div>
              </div>
              <div className="md:col-span-4">
                <div className="text-xs font-medium text-muted-foreground">
                  Descripción
                </div>
                <div>{asientoSeleccionado.descripcion ?? "-"}</div>
              </div>
            </div>
          )}

          {isLoadingDetalles ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Debe</TableHead>
                  <TableHead className="text-right">Haber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detallesAsiento.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No hay detalles registrados para este asiento.
                    </TableCell>
                  </TableRow>
                ) : (
                  detallesAsiento.map((detalle) => (
                    <TableRow key={detalle.idAsientoDetalle ?? detalle.item}>
                      <TableCell>{detalle.item}</TableCell>
                      <TableCell>{detalle.cuentaContable ?? "-"}</TableCell>
                      <TableCell>{detalle.descripcionItem ?? "-"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {detalle.tipoMovimiento === "Debe"
                          ? money(detalle.monto)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {detalle.tipoMovimiento === "Haber"
                          ? money(detalle.monto)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </FormSheet>
    </>
  );
}
