"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Play,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { FormSheet } from "@/components/shared/form-sheet";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { empleadosAPI } from "@/services/empleadosAPI";
import { cuentasContablesAPI } from "@/services/cuentasContablesAPI";
import {
  conceptosSalariosAPI,
  getBusinessErrorMessage,
  procesosPagosSalariosAPI,
} from "@/services/rrhhAPI";
import { formatearFecha } from "@/utils/date-utils";
import { formatGuaranies } from "@/utils/money-format";
import { notify } from "@/lib/notifications";
import {
  CerrarProcesoPagoSalarioDTO,
  ConceptoSalario,
  CuentaContable,
  Empleado,
  PagoSalarioDetalle,
  PagoSalarioDetalleSaveDTO,
  ProcesoPagoSalario,
  ProcesoPagoSalarioSaveDTO,
  ReciboSalario,
} from "@/types/types";

const noneValue = "__none__";

function empleadoLabel(empleado: Empleado) {
  return `${empleado.nombres} ${empleado.apellidos}`.trim();
}

function cuentaLabel(cuenta: CuentaContable) {
  return `${cuenta.numeroCuenta} - ${cuenta.nombre}`;
}

function estadoVariant(estado: string) {
  if (estado === "Cerrado") return "default";
  if (estado === "Verificado") return "activo";
  return "secondary";
}

function currentIsoDate() {
  return new Date().toISOString().substring(0, 10);
}

export default function NominaPage() {
  const [procesos, setProcesos] = useState<ProcesoPagoSalario[]>([]);
  const [detalles, setDetalles] = useState<PagoSalarioDetalle[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoSalario[]>([]);
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetMode, setSheetMode] = useState<
    "proceso" | "detalle" | "cierre" | null
  >(null);
  const [detalleEditado, setDetalleEditado] =
    useState<PagoSalarioDetalle | null>(null);
  const [recibos, setRecibos] = useState<ReciboSalario[]>([]);
  const [isRecibosOpen, setIsRecibosOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const procesoSeleccionado = useMemo(
    () =>
      procesos.find((proceso) => proceso.idProcesoPagoSalario === selectedId) ??
      null,
    [procesos, selectedId],
  );

  const procesoAbierto = procesoSeleccionado?.estado === "Abierto";
  const procesoVerificado = procesoSeleccionado?.estado === "Verificado";
  const procesoCerrado = procesoSeleccionado?.estado === "Cerrado";

  const cargarInicial = async () => {
    setIsLoading(true);
    try {
      const [procesosRes, empleadosRes, conceptosRes, cuentasRes] =
        await Promise.all([
          procesosPagosSalariosAPI.getAll(1, 200),
          empleadosAPI.getAll(1, 1000),
          conceptosSalariosAPI.getAll(1, 1000),
          cuentasContablesAPI.getAll(1, 1000),
        ]);

      const procesosOrdenados = [...procesosRes.items].sort(
        (a, b) =>
          b.periodoAnho - a.periodoAnho ||
          b.periodoMes - a.periodoMes ||
          b.idProcesoPagoSalario - a.idProcesoPagoSalario,
      );
      setProcesos(procesosOrdenados);
      setEmpleados(empleadosRes.items);
      setConceptos(conceptosRes.items);
      setCuentas(cuentasRes.items);
      setSelectedId((prev) => prev ?? procesosOrdenados[0]?.idProcesoPagoSalario ?? null);
    } catch (error) {
      console.error("Error al cargar nómina:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDetalles = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const response = await procesosPagosSalariosAPI.getDetalles(id);
      setDetalles(response);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    cargarInicial();
  }, []);

  useEffect(() => {
    if (selectedId) {
      cargarDetalles(selectedId);
    } else {
      setDetalles([]);
    }
  }, [selectedId]);

  const procesosFiltrados = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return procesos;
    return procesos.filter((proceso) =>
      `${proceso.periodoAnho} ${proceso.periodoMes} ${proceso.estado} ${proceso.fechaPago}`
        .toLowerCase()
        .includes(query),
    );
  }, [procesos, searchTerm]);

  const refrescarProcesoSeleccionado = async (proceso: ProcesoPagoSalario) => {
    setProcesos((prev) =>
      prev.map((item) =>
        item.idProcesoPagoSalario === proceso.idProcesoPagoSalario
          ? proceso
          : item,
      ),
    );
    setSelectedId(proceso.idProcesoPagoSalario);
    await cargarDetalles(proceso.idProcesoPagoSalario);
  };

  const ejecutarAccion = async (
    accion: () => Promise<ProcesoPagoSalario>,
    mensaje: string,
  ) => {
    if (!procesoSeleccionado) return;
    setIsSubmitting(true);
    try {
      const response = await accion();
      await refrescarProcesoSeleccionado(response);
      notify.success("Listo", mensaje);
    } catch (error) {
      console.error("Error en acción de nómina:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrearProceso = async (data: ProcesoPagoSalarioSaveDTO) => {
    setIsSubmitting(true);
    try {
      const response = await procesosPagosSalariosAPI.create(data);
      await cargarInicial();
      setSelectedId(response.idProcesoPagoSalario);
      setSheetMode(null);
      notify.success("Registrado", "Proceso de pago creado correctamente.");
    } catch (error) {
      console.error("Error al crear proceso:", error);
      notify.error("Error", getBusinessErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardarDetalle = async (data: PagoSalarioDetalleSaveDTO) => {
    if (!procesoSeleccionado) return;

    setIsSubmitting(true);
    try {
      if (detalleEditado) {
        await procesosPagosSalariosAPI.updateDetalle(
          procesoSeleccionado.idProcesoPagoSalario,
          detalleEditado.idPagoSalarioDetalle,
          data,
        );
        notify.success("Actualizado", "Detalle actualizado correctamente.");
      } else {
        await procesosPagosSalariosAPI.createDetalle(
          procesoSeleccionado.idProcesoPagoSalario,
          data,
        );
        notify.success("Registrado", "Detalle agregado correctamente.");
      }
      setSheetMode(null);
      setDetalleEditado(null);
      await cargarDetalles(procesoSeleccionado.idProcesoPagoSalario);
      const actualizado = await procesosPagosSalariosAPI.getById(
        procesoSeleccionado.idProcesoPagoSalario,
      );
      await refrescarProcesoSeleccionado(actualizado);
    } catch (error) {
      console.error("Error al guardar detalle:", error);
      notify.error("Error", getBusinessErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const eliminarDetalle = async (detalle: PagoSalarioDetalle) => {
    if (!procesoSeleccionado || !procesoAbierto) return;

    setIsSubmitting(true);
    try {
      await procesosPagosSalariosAPI.deleteDetalle(
        procesoSeleccionado.idProcesoPagoSalario,
        detalle.idPagoSalarioDetalle,
      );
      notify.success("Eliminado", "Detalle eliminado correctamente.");
      await cargarDetalles(procesoSeleccionado.idProcesoPagoSalario);
      const actualizado = await procesosPagosSalariosAPI.getById(
        procesoSeleccionado.idProcesoPagoSalario,
      );
      await refrescarProcesoSeleccionado(actualizado);
    } catch (error) {
      console.error("Error al eliminar detalle:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCerrarProceso = async (data: CerrarProcesoPagoSalarioDTO) => {
    if (!procesoSeleccionado) return;

    setIsSubmitting(true);
    try {
      const response = await procesosPagosSalariosAPI.cerrar(
        procesoSeleccionado.idProcesoPagoSalario,
        data,
      );
      await refrescarProcesoSeleccionado(response);
      setSheetMode(null);
      notify.success("Cerrado", "Proceso cerrado y asiento generado.");
    } catch (error) {
      console.error("Error al cerrar proceso:", error);
      notify.error("Error", getBusinessErrorMessage(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cargarRecibos = async () => {
    if (!procesoSeleccionado) return;
    setIsSubmitting(true);
    try {
      const response = await procesosPagosSalariosAPI.getRecibos(
        procesoSeleccionado.idProcesoPagoSalario,
      );
      setRecibos(response);
      setIsRecibosOpen(true);
    } catch (error) {
      console.error("Error al cargar recibos:", error);
      notify.error("Error", getBusinessErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageBreadcrumb
        steps={[{ label: "RRHH", href: "/dashboard" }, { label: "Nómina" }]}
      />

      <PageHeader
        title="Pago de salarios"
        description="Generación, revisión, cierre y recibos de nómina."
        buttonLabel="Nuevo proceso"
        onButtonClick={() => setSheetMode("proceso")}
      />

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar proceso..."
                className="h-9 bg-white pl-9 text-sm"
              />
            </div>

            <div className="rounded-md border bg-white shadow-sm">
              {procesosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No hay procesos registrados.
                </div>
              ) : (
                procesosFiltrados.map((proceso) => (
                  <button
                    key={proceso.idProcesoPagoSalario}
                    type="button"
                    onClick={() => setSelectedId(proceso.idProcesoPagoSalario)}
                    className={`flex w-full items-center justify-between border-b px-3 py-3 text-left text-sm last:border-b-0 hover:bg-muted/50 ${
                      selectedId === proceso.idProcesoPagoSalario
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <span>
                      <span className="block font-medium">
                        {proceso.periodoMes.toString().padStart(2, "0")}/
                        {proceso.periodoAnho}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Pago {formatearFecha(proceso.fechaPago)}
                      </span>
                    </span>
                    <Badge variant={estadoVariant(proceso.estado)}>
                      {proceso.estado}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className="space-y-4">
            {!procesoSeleccionado ? (
              <div className="rounded-md border bg-white p-10 text-center text-sm text-muted-foreground">
                Seleccione o cree un proceso de pago.
              </div>
            ) : (
              <>
                <section className="rounded-md border bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          Periodo{" "}
                          {procesoSeleccionado.periodoMes
                            .toString()
                            .padStart(2, "0")}
                          /{procesoSeleccionado.periodoAnho}
                        </h2>
                        <Badge variant={estadoVariant(procesoSeleccionado.estado)}>
                          {procesoSeleccionado.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Fecha de pago: {formatearFecha(procesoSeleccionado.fechaPago)}
                        {procesoSeleccionado.idAsiento
                          ? ` · Asiento #${procesoSeleccionado.idAsiento}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!procesoAbierto || isSubmitting}
                        onClick={() =>
                          ejecutarAccion(
                            () =>
                              procesosPagosSalariosAPI.generar(
                                procesoSeleccionado.idProcesoPagoSalario,
                              ),
                            "Detalles automáticos generados.",
                          )
                        }
                      >
                        <Play className="mr-2 size-4" />
                        Generar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!procesoAbierto || isSubmitting}
                        onClick={() => {
                          setDetalleEditado(null);
                          setSheetMode("detalle");
                        }}
                      >
                        <Plus className="mr-2 size-4" />
                        Detalle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!procesoAbierto || isSubmitting}
                        onClick={() =>
                          ejecutarAccion(
                            () =>
                              procesosPagosSalariosAPI.verificar(
                                procesoSeleccionado.idProcesoPagoSalario,
                              ),
                            "Proceso verificado correctamente.",
                          )
                        }
                      >
                        <CheckCircle2 className="mr-2 size-4" />
                        Verificar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!procesoVerificado || isSubmitting}
                        onClick={() => setSheetMode("cierre")}
                      >
                        <FileText className="mr-2 size-4" />
                        Cerrar
                      </Button>
                      <Button
                        size="sm"
                        disabled={!procesoCerrado || isSubmitting}
                        onClick={cargarRecibos}
                      >
                        <Printer className="mr-2 size-4" />
                        Recibos
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <TotalBox
                      label="Total ingresos"
                      value={procesoSeleccionado.totalIngresos}
                    />
                    <TotalBox
                      label="Total egresos"
                      value={procesoSeleccionado.totalEgresos}
                    />
                    <TotalBox
                      label="Neto a pagar"
                      value={procesoSeleccionado.totalNeto}
                    />
                  </div>
                </section>

                {isDetailLoading ? (
                  <div className="flex justify-center p-10">
                    <Loader2 className="animate-spin text-primary" />
                  </div>
                ) : (
                  <DataTable
                    caption="Detalles del proceso de pago."
                    headerRow={
                      <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Concepto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Observación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    }
                  >
                    {detalles.map((detalle) => (
                      <TableRow key={detalle.idPagoSalarioDetalle}>
                        <TableCell>{detalle.empleado}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {detalle.conceptoSalario}
                          </div>
                          {detalle.deducibleIps && (
                            <div className="text-xs text-muted-foreground">
                              Deducible IPS
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              detalle.tipo === "Ingreso" ? "activo" : "secondary"
                            }
                          >
                            {detalle.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {detalle.esAutomatico ? "Automático" : "Manual"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatGuaranies(detalle.monto)}
                        </TableCell>
                        <TableCell>{detalle.observacion ?? "—"}</TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!procesoAbierto}
                            onClick={() => {
                              setDetalleEditado(detalle);
                              setSheetMode("detalle");
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!procesoAbierto || isSubmitting}
                            onClick={() => eliminarDetalle(detalle)}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {detalles.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No hay detalles generados para este proceso.
                        </TableCell>
                      </TableRow>
                    )}
                  </DataTable>
                )}
              </>
            )}
          </main>
        </div>
      )}

      <FormSheet
        open={sheetMode === "proceso"}
        onOpenChange={(open) => setSheetMode(open ? "proceso" : null)}
        title="Nuevo proceso de pago"
        description="Periodo y fecha de pago para la liquidación salarial."
      >
        <ProcesoForm
          isSubmitting={isSubmitting}
          onSubmit={handleCrearProceso}
          onCancel={() => setSheetMode(null)}
        />
      </FormSheet>

      <FormSheet
        open={sheetMode === "detalle"}
        onOpenChange={(open) => {
          setSheetMode(open ? "detalle" : null);
          if (!open) setDetalleEditado(null);
        }}
        title={detalleEditado ? "Editar detalle" : "Nuevo detalle manual"}
        description="Ajustes manuales disponibles solo en procesos abiertos."
      >
        <DetalleForm
          key={detalleEditado?.idPagoSalarioDetalle ?? "nuevo-detalle"}
          detalleEditado={detalleEditado}
          empleados={empleados}
          conceptos={conceptos}
          isSubmitting={isSubmitting}
          onSubmit={handleGuardarDetalle}
          onCancel={() => {
            setDetalleEditado(null);
            setSheetMode(null);
          }}
        />
      </FormSheet>

      <FormSheet
        open={sheetMode === "cierre"}
        onOpenChange={(open) => setSheetMode(open ? "cierre" : null)}
        title="Cerrar proceso"
        description="Cuentas contables para generar el asiento de pago."
        contentClassName="px-6 sm:max-w-[620px] sm:min-w-[520px]"
      >
        <CierreForm
          key={procesoSeleccionado?.idProcesoPagoSalario ?? "cierre"}
          proceso={procesoSeleccionado}
          cuentas={cuentas}
          isSubmitting={isSubmitting}
          onSubmit={handleCerrarProceso}
          onCancel={() => setSheetMode(null)}
        />
      </FormSheet>

      <RecibosDialog
        open={isRecibosOpen}
        onOpenChange={setIsRecibosOpen}
        recibos={recibos}
      />
    </>
  );
}

function TotalBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{formatGuaranies(value)}</div>
    </div>
  );
}

function ProcesoForm({
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  isSubmitting: boolean;
  onSubmit: (data: ProcesoPagoSalarioSaveDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const now = new Date();
  const [formData, setFormData] = useState({
    periodoAnho: now.getFullYear().toString(),
    periodoMes: (now.getMonth() + 1).toString(),
    fechaPago: currentIsoDate(),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const periodoMes = Number(formData.periodoMes);
    if (periodoMes < 1 || periodoMes > 12) {
      notify.error("Error", "El mes debe estar entre 1 y 12.");
      return;
    }

    await onSubmit({
      periodoAnho: Number(formData.periodoAnho),
      periodoMes,
      fechaPago: formData.fechaPago,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Año">
          <Input
            type="number"
            value={formData.periodoAnho}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                periodoAnho: event.target.value,
              }))
            }
            required
          />
        </Field>
        <Field label="Mes">
          <Input
            type="number"
            min={1}
            max={12}
            value={formData.periodoMes}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                periodoMes: event.target.value,
              }))
            }
            required
          />
        </Field>
      </div>

      <Field label="Fecha de pago">
        <Input
          type="date"
          value={formData.fechaPago}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, fechaPago: event.target.value }))
          }
          required
        />
      </Field>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel="Guardar proceso"
        onCancel={onCancel}
      />
    </form>
  );
}

function DetalleForm({
  detalleEditado,
  empleados,
  conceptos,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  detalleEditado: PagoSalarioDetalle | null;
  empleados: Empleado[];
  conceptos: ConceptoSalario[];
  isSubmitting: boolean;
  onSubmit: (data: PagoSalarioDetalleSaveDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    idEmpleado: detalleEditado?.idEmpleado?.toString() ?? "",
    idConceptoSalario:
      detalleEditado?.idConceptoSalario?.toString() ?? "",
    monto: detalleEditado?.monto?.toString() ?? "",
    observacion: detalleEditado?.observacion ?? "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (Number(formData.monto) < 0) {
      notify.error("Error", "El monto no puede ser negativo.");
      return;
    }

    await onSubmit({
      idEmpleado: Number(formData.idEmpleado),
      idConceptoSalario: Number(formData.idConceptoSalario),
      monto: Number(formData.monto),
      observacion: formData.observacion.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <SelectField
        label="Empleado"
        value={formData.idEmpleado}
        placeholder="Seleccionar empleado"
        options={empleados.map((empleado) => ({
          value: empleado.idEmpleado.toString(),
          label: empleadoLabel(empleado),
        }))}
        onChange={(idEmpleado) =>
          setFormData((prev) => ({ ...prev, idEmpleado }))
        }
      />

      <SelectField
        label="Concepto"
        value={formData.idConceptoSalario}
        placeholder="Seleccionar concepto"
        options={conceptos.map((concepto) => ({
          value: concepto.idConceptoSalario.toString(),
          label: `${concepto.codigo} - ${concepto.descripcion} (${concepto.tipo})`,
        }))}
        onChange={(idConceptoSalario) =>
          setFormData((prev) => ({ ...prev, idConceptoSalario }))
        }
      />

      <Field label="Monto">
        <Input
          type="number"
          min={0}
          value={formData.monto}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, monto: event.target.value }))
          }
          required
        />
      </Field>

      <Field label="Observación">
        <Textarea
          value={formData.observacion}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              observacion: event.target.value,
            }))
          }
        />
      </Field>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={detalleEditado ? "Actualizar detalle" : "Guardar detalle"}
        onCancel={onCancel}
      />
    </form>
  );
}

function CierreForm({
  proceso,
  cuentas,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  proceso: ProcesoPagoSalario | null;
  cuentas: CuentaContable[];
  isSubmitting: boolean;
  onSubmit: (data: CerrarProcesoPagoSalarioDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    idModulo: "1",
    idCuentaGastoSalarios: "",
    idCuentaPago: "",
    idCuentaIpsPagar: "",
    idCuentaOtrosEgresosPagar: "",
    descripcionAsiento: proceso
      ? `Pago de salarios ${proceso.periodoMes}/${proceso.periodoAnho}`
      : "",
  });

  const cuentasAsentables = cuentas.filter((cuenta) => cuenta.esAsentable);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      idModulo: Number(formData.idModulo),
      idCuentaGastoSalarios: Number(formData.idCuentaGastoSalarios),
      idCuentaPago: Number(formData.idCuentaPago),
      idCuentaIpsPagar: formData.idCuentaIpsPagar
        ? Number(formData.idCuentaIpsPagar)
        : null,
      idCuentaOtrosEgresosPagar: formData.idCuentaOtrosEgresosPagar
        ? Number(formData.idCuentaOtrosEgresosPagar)
        : null,
      descripcionAsiento: formData.descripcionAsiento,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <Field label="Módulo">
        <Input
          type="number"
          value={formData.idModulo}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, idModulo: event.target.value }))
          }
          required
        />
      </Field>

      <SelectField
        label="Cuenta gasto salarios"
        value={formData.idCuentaGastoSalarios}
        placeholder="Seleccionar cuenta"
        options={cuentasAsentables.map((cuenta) => ({
          value: cuenta.idCuentaContable.toString(),
          label: cuentaLabel(cuenta),
        }))}
        onChange={(idCuentaGastoSalarios) =>
          setFormData((prev) => ({ ...prev, idCuentaGastoSalarios }))
        }
      />

      <SelectField
        label="Cuenta de pago"
        value={formData.idCuentaPago}
        placeholder="Seleccionar cuenta"
        options={cuentasAsentables.map((cuenta) => ({
          value: cuenta.idCuentaContable.toString(),
          label: cuentaLabel(cuenta),
        }))}
        onChange={(idCuentaPago) =>
          setFormData((prev) => ({ ...prev, idCuentaPago }))
        }
      />

      <SelectField
        label="Cuenta IPS a pagar"
        value={formData.idCuentaIpsPagar}
        placeholder="Opcional"
        allowEmpty
        options={cuentasAsentables.map((cuenta) => ({
          value: cuenta.idCuentaContable.toString(),
          label: cuentaLabel(cuenta),
        }))}
        onChange={(idCuentaIpsPagar) =>
          setFormData((prev) => ({ ...prev, idCuentaIpsPagar }))
        }
      />

      <SelectField
        label="Cuenta otros egresos a pagar"
        value={formData.idCuentaOtrosEgresosPagar}
        placeholder="Opcional"
        allowEmpty
        options={cuentasAsentables.map((cuenta) => ({
          value: cuenta.idCuentaContable.toString(),
          label: cuentaLabel(cuenta),
        }))}
        onChange={(idCuentaOtrosEgresosPagar) =>
          setFormData((prev) => ({ ...prev, idCuentaOtrosEgresosPagar }))
        }
      />

      <Field label="Descripción asiento">
        <Textarea
          value={formData.descripcionAsiento}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              descripcionAsiento: event.target.value,
            }))
          }
          required
        />
      </Field>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel="Cerrar proceso"
        onCancel={onCancel}
      />
    </form>
  );
}

function RecibosDialog({
  open,
  onOpenChange,
  recibos,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recibos: ReciboSalario[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Recibos de salario</DialogTitle>
          <DialogDescription>
            Copias original y duplicado generadas por funcionario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {recibos.map((recibo, index) => (
            <section
              key={`${recibo.idEmpleado}-${recibo.copia}-${index}`}
              className="rounded-md border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3 border-b pb-3">
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {recibo.copia}
                  </div>
                  <h3 className="text-base font-semibold">{recibo.empleado}</h3>
                  <p className="text-sm text-muted-foreground">
                    CI {recibo.ci || "—"} · RUC {recibo.ruc || "—"} · Periodo{" "}
                    {recibo.periodoMes}/{recibo.periodoAnho}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    Neto a pagar
                  </div>
                  <div className="text-lg font-semibold">
                    {formatGuaranies(recibo.netoPagar)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <ReciboItems title="Ingresos" items={recibo.ingresos} />
                <ReciboItems title="Egresos" items={recibo.egresos} />
              </div>

              <div className="mt-3 flex justify-end gap-6 border-t pt-3 text-sm">
                <span>Ingresos: {formatGuaranies(recibo.totalIngresos)}</span>
                <span>Egresos: {formatGuaranies(recibo.totalEgresos)}</span>
              </div>
            </section>
          ))}
          {recibos.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay recibos disponibles.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReciboItems({
  title,
  items,
}: {
  title: string;
  items: ReciboSalario["ingresos"];
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={`${item.conceptoSalario ?? item.concepto ?? index}-${index}`}
            className="flex justify-between gap-3 text-sm"
          >
            <span>
              {item.conceptoSalario ?? item.concepto ?? item.descripcion ?? "Concepto"}
            </span>
            <span className="font-medium">{formatGuaranies(item.monto)}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground">Sin registros.</div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FormActions({
  isSubmitting,
  submitLabel,
  onCancel,
}: {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="mt-4 flex justify-end gap-3 border-t pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  allowEmpty,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <Select
        value={value || noneValue}
        onValueChange={(nextValue) =>
          onChange(nextValue === noneValue ? "" : nextValue)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[320px]">
          <SelectItem value={noneValue} disabled={!allowEmpty}>
            {placeholder}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
