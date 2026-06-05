"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FieldWrapper } from "@/components/FieldWrapper";
import { FormContainer } from "@/components/FormContainer";
import {
  ContabilidadProcessSelector,
  isProcesoContableHabilitado,
} from "@/components/contabilidad/contabilidad-process-selector";
import { Combobox } from "@/components/shared/combobox";
import {
  asientosAPI,
  cuentasContablesAPI,
  periodosContablesAPI,
} from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import {
  AsientoCompletoPayloadDTO,
  AsientoDetalleDTO,
  AsientoDTO,
  CuentaContableDTO,
  PeriodoContableDTO,
  ProcesoContableDTO,
} from "@/types/types";

interface AsientoDetalleFormRow {
  id: number;
  idCuentaContable: string;
  descripcion: string;
  debe: string;
  haber: string;
}

interface AsientoFormState {
  fecha: string;
  descripcion: string;
  estado: string;
}

interface AsientoFormProps {
  asientoEditado?: AsientoDTO | null;
  detallesEditados?: AsientoDetalleDTO[];
  initialProcesoId?: number | null;
}

const MANUAL_ACCOUNTING_MODULE_ID = 3;

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function money(value: number) {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPeriodo(periodo: PeriodoContableDTO) {
  return `${String(periodo.mes).padStart(2, "0")}/${periodo.anho}`;
}

function getCuentaCodigo(cuenta: CuentaContableDTO) {
  return cuenta.numeroCuenta ?? cuenta.codigo ?? "";
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

  return "No se pudo guardar el asiento.";
}

function nuevaLinea(): AsientoDetalleFormRow {
  return {
    id: Date.now() + Math.random(),
    idCuentaContable: "",
    descripcion: "",
    debe: "",
    haber: "",
  };
}

function asientoDetalleToFormRow(
  detalle: AsientoDetalleDTO,
): AsientoDetalleFormRow {
  const monto = String(detalle.monto ?? "");
  return {
    id: detalle.idAsientoDetalle ?? Date.now() + Math.random(),
    idCuentaContable: String(detalle.idCuentaContable ?? ""),
    descripcion: detalle.descripcionItem ?? "",
    debe: detalle.tipoMovimiento === "Debe" ? monto : "",
    haber: detalle.tipoMovimiento === "Haber" ? monto : "",
  };
}

function fechaToInputValue(fecha: string) {
  return fecha ? fecha.slice(0, 10) : todayISODate();
}

export function AsientoForm({
  asientoEditado = null,
  detallesEditados = [],
  initialProcesoId = null,
}: AsientoFormProps = {}) {
  const router = useRouter();
  const [proceso, setProceso] = useState<ProcesoContableDTO | null>(null);
  const [cuentas, setCuentas] = useState<CuentaContableDTO[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoContableDTO[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAccountIds, setRecentAccountIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<AsientoFormState>({
    fecha: asientoEditado
      ? fechaToInputValue(asientoEditado.fecha)
      : todayISODate(),
    descripcion: asientoEditado?.descripcion ?? "",
    estado: asientoEditado?.estado ?? "Registrado",
  });
  const [detalles, setDetalles] = useState<AsientoDetalleFormRow[]>([
    ...(detallesEditados.length
      ? detallesEditados.map(asientoDetalleToFormRow)
      : [nuevaLinea(), nuevaLinea()]),
  ]);
  const isEditing = !!asientoEditado;
  const procesoHabilitado = isProcesoContableHabilitado(proceso);
  const procesoId = proceso?.idProcesoContable;

  useEffect(() => {
    if (!procesoId) {
      setCuentas([]);
      setPeriodos([]);
      return;
    }

    const cargarDatos = async () => {
      try {
        const [cuentasResponse, periodosResponse] = await Promise.all([
          cuentasContablesAPI.getAll(1, 500, procesoId),
          periodosContablesAPI.getAll(1, 100),
        ]);
        setCuentas(cuentasResponse.items);
        setPeriodos(
          periodosResponse.items.filter(
            (periodo) => periodo.idProcesoContable === procesoId,
          ),
        );
      } catch (error) {
        console.error("Error al cargar datos contables:", error);
        notify.error(
          "Error de conexión",
          "No se pudieron obtener las cuentas o periodos.",
        );
      }
    };

    cargarDatos();
  }, [procesoId]);

  const cuentasAsentables = useMemo(
    () => cuentas.filter((cuenta) => cuenta.activa && cuenta.esAsentable),
    [cuentas],
  );

  const periodoSeleccionado = useMemo(() => {
    const fecha = formData.fecha;
    return (
      periodos.find(
        (periodo) =>
          fecha >= periodo.fechaInicio.slice(0, 10) &&
          fecha <= periodo.fechaFin.slice(0, 10),
      ) ?? null
    );
  }, [periodos, formData.fecha]);

  const totalDebe = useMemo(
    () => detalles.reduce((total, row) => total + (Number(row.debe) || 0), 0),
    [detalles],
  );
  const totalHaber = useMemo(
    () => detalles.reduce((total, row) => total + (Number(row.haber) || 0), 0),
    [detalles],
  );
  const diferencia = totalDebe - totalHaber;
  const asientoBalanceado =
    Math.abs(diferencia) <= 0.001 && totalDebe > 0 && totalHaber > 0;

  const rememberAccount = (accountId: string) => {
    setRecentAccountIds((prev) =>
      [accountId, ...prev.filter((id) => id !== accountId)].slice(0, 5),
    );
  };

  const updateDetalle = <K extends keyof AsientoDetalleFormRow>(
    index: number,
    field: K,
    value: AsientoDetalleFormRow[K],
  ) => {
    setDetalles((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validar = () => {
    if (!proceso) return "Debe seleccionar un proceso contable.";
    if (!procesoHabilitado) {
      return "Solo se pueden registrar asientos en procesos contables habilitados.";
    }
    if (!formData.fecha) return "Debe seleccionar una fecha.";
    if (!formData.descripcion.trim()) return "Debe ingresar una descripción.";
    if (detalles.length < 2) return "El asiento debe tener al menos dos líneas.";

    for (const [index, detalle] of detalles.entries()) {
      const debe = Number(detalle.debe) || 0;
      const haber = Number(detalle.haber) || 0;

      if (!detalle.idCuentaContable) {
        return `La línea ${index + 1} no tiene cuenta contable.`;
      }
      if ((debe > 0 && haber > 0) || (debe <= 0 && haber <= 0)) {
        return `La línea ${index + 1} debe tener un importe positivo solo en Debe o Haber.`;
      }
    }

    if (totalDebe <= 0 || totalHaber <= 0) {
      return "El asiento debe tener importes en Debe y Haber.";
    }
    if (Math.abs(totalDebe - totalHaber) > 0.001) {
      return "El total Debe debe ser igual al total Haber.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validar();
    if (validationError) {
      notify.error("Asiento inválido", validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: AsientoCompletoPayloadDTO = {
        idModulo: asientoEditado?.idModulo ?? MANUAL_ACCOUNTING_MODULE_ID,
        fecha: formData.fecha,
        descripcion: formData.descripcion.trim(),
        automatico: asientoEditado?.automatico ?? false,
        estado: formData.estado || "Registrado",
        referenciaOrigen:
          asientoEditado?.referenciaOrigen ?? `MANUAL-${Date.now()}`,
        idOrigen: asientoEditado?.idOrigen ?? null,
        createdAt: asientoEditado?.createdAt ?? null,
        fechaMayorizacion: asientoEditado?.fechaMayorizacion ?? null,
        detalles: detalles.map((detalle, index) => {
          const debe = Number(detalle.debe) || 0;
          const haber = Number(detalle.haber) || 0;
          return {
            item: index + 1,
            idCuentaContable: Number(detalle.idCuentaContable),
            descripcionItem:
              detalle.descripcion.trim() || formData.descripcion.trim(),
            tipoMovimiento: debe > 0 ? "Debe" : "Haber",
            monto: debe > 0 ? debe : haber,
          };
        }),
      };

      if (asientoEditado) {
        await asientosAPI.updateCompleto(asientoEditado.idAsiento, payload);
      } else {
        await asientosAPI.createCompleto(payload);
      }
      notify.success(
        asientoEditado ? "Asiento actualizado" : "Asiento registrado",
        asientoEditado
          ? "El asiento contable fue actualizado correctamente."
          : "El asiento contable fue guardado correctamente.",
      );
      router.push("/contabilidad/asientos");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar asiento:", error);
      notify.error("Error al guardar", getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <ContabilidadProcessSelector
        value={proceso?.idProcesoContable ?? initialProcesoId}
        onChange={(selected) => setProceso(selected)}
      />

      {proceso && !procesoHabilitado && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          El proceso seleccionado no está habilitado. Los asientos solo pueden
          modificarse en procesos habilitados.
        </div>
      )}

      <FormContainer
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        onCancel={() => router.push("/contabilidad/asientos")}
        isEditing={isEditing}
        submitText={{ save: "Guardar Asiento", update: "Actualizar" }}
        submitDisabled={isSubmitting || !proceso || !procesoHabilitado}
      >
        <div className="rounded-md border bg-white p-3 shadow-sm">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <FieldWrapper id="fecha" label="Fecha">
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    fecha: event.target.value,
                  }))
                }
                required
                disabled={!procesoHabilitado}
                className="h-8 rounded-md"
              />
            </FieldWrapper>
            <FieldWrapper id="periodo" label="Periodo">
              <Input
                id="periodo"
                value={
                  periodoSeleccionado
                    ? formatPeriodo(periodoSeleccionado)
                    : "Sin periodo"
                }
                readOnly
                className="h-8 rounded-md bg-gray-100"
              />
            </FieldWrapper>
            <FieldWrapper id="estado" label="Estado">
              <Input
                id="estado"
                value={formData.estado}
                readOnly
                className="h-8 rounded-md bg-gray-100"
              />
            </FieldWrapper>
            <FieldWrapper id="numeroAsiento" label="Nº Asiento">
              <Input
                id="numeroAsiento"
                value={
                  asientoEditado
                    ? String(asientoEditado.numeroAsiento)
                    : "Automático"
                }
                readOnly
                className="h-8 rounded-md bg-gray-100"
              />
            </FieldWrapper>
            <FieldWrapper
              id="descripcion"
              label="Descripción"
              className="col-span-2 md:col-span-4"
            >
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
                required
                disabled={!procesoHabilitado}
                className="h-8 rounded-md"
              />
            </FieldWrapper>
          </div>
        </div>

        <div className="rounded-md border bg-white shadow-sm">
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 min-w-[300px] px-2">
                  Cuenta contable
                </TableHead>
                <TableHead className="h-8 min-w-[220px] px-2">
                  Descripción
                </TableHead>
                <TableHead className="h-8 w-[150px] px-2 text-right">
                  Debe
                </TableHead>
                <TableHead className="h-8 w-[150px] px-2 text-right">
                  Haber
                </TableHead>
                <TableHead className="h-8 w-[44px] px-1 text-right">
                  {" "}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detalles.map((detalle, index) => (
                <TableRow key={detalle.id} className="h-9 hover:bg-slate-50">
                  <TableCell className="p-1.5">
                    <Combobox
                      value={detalle.idCuentaContable}
                      items={cuentasAsentables}
                      onChange={(value) =>
                        updateDetalle(index, "idCuentaContable", value)
                      }
                      getItemValue={(cuenta) => String(cuenta.idCuentaContable)}
                      getItemSearchText={(cuenta) =>
                        `${getCuentaCodigo(cuenta)} ${cuenta.nombre}`.trim()
                      }
                      getItemDisplayValue={(cuenta) =>
                        `${getCuentaCodigo(cuenta)} - ${cuenta.nombre}`
                      }
                      renderItem={(cuenta) => (
                        <>
                          <span className="min-w-14 font-mono text-xs font-semibold tabular-nums">
                            {getCuentaCodigo(cuenta) || "S/C"}
                          </span>
                          <span className="truncate">{cuenta.nombre}</span>
                        </>
                      )}
                      placeholder="Código o cuenta"
                      emptyMessage="Sin cuentas coincidentes"
                      recentValues={recentAccountIds}
                      onSelectRecent={rememberAccount}
                      disabled={!procesoHabilitado}
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={detalle.descripcion}
                      onChange={(event) =>
                        updateDetalle(index, "descripcion", event.target.value)
                      }
                      placeholder="Detalle"
                      disabled={!procesoHabilitado}
                      className="h-7 rounded-md text-sm focus-visible:ring-2"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalle.debe}
                      onChange={(event) => {
                        updateDetalle(index, "debe", event.target.value);
                        if (Number(event.target.value) > 0) {
                          updateDetalle(index, "haber", "");
                        }
                      }}
                      className="h-7 rounded-md text-right font-mono text-sm font-semibold tabular-nums focus-visible:ring-2"
                      disabled={!procesoHabilitado}
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detalle.haber}
                      onChange={(event) => {
                        updateDetalle(index, "haber", event.target.value);
                        if (Number(event.target.value) > 0) {
                          updateDetalle(index, "debe", "");
                        }
                      }}
                      className="h-7 rounded-md text-right font-mono text-sm font-semibold tabular-nums focus-visible:ring-2"
                      disabled={!procesoHabilitado}
                    />
                  </TableCell>
                  <TableCell className="p-1 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={detalles.length <= 2 || !procesoHabilitado}
                      onClick={() =>
                        setDetalles((prev) =>
                          prev.filter((_, rowIndex) => rowIndex !== index),
                        )
                      }
                      className="size-7 cursor-pointer"
                      aria-label={`Eliminar línea ${index + 1}`}
                      title="Eliminar línea"
                    >
                      <Trash2
                        className="size-3.5 text-destructive"
                        aria-hidden="true"
                      />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDetalles((prev) => [...prev, nuevaLinea()])}
            disabled={!procesoHabilitado}
            className="h-8 cursor-pointer"
          >
            <Plus className="size-4" />
            Agregar línea
          </Button>
        </div>

        <div
          className={cn(
            "sticky bottom-2 z-20 flex flex-col gap-2 rounded-md border px-3 py-2 shadow-lg md:flex-row md:items-center md:justify-between",
            asientoBalanceado
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              asientoBalanceado ? "text-emerald-800" : "text-red-800",
            )}
          >
            {asientoBalanceado ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
            {asientoBalanceado
              ? "Asiento balanceado"
              : "Asiento con diferencia"}
          </div>
          <div className="grid grid-cols-3 gap-3 text-right text-sm md:min-w-[560px]">
            <div>
              <div className="text-[11px] font-medium uppercase text-muted-foreground">
                Total Debe
              </div>
              <div className="font-mono font-bold tabular-nums">
                {money(totalDebe)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium uppercase text-muted-foreground">
                Total Haber
              </div>
              <div className="font-mono font-bold tabular-nums">
                {money(totalHaber)}
              </div>
            </div>
            <div className={asientoBalanceado ? "text-emerald-800" : "text-red-800"}>
              <div className="text-[11px] font-medium uppercase">
                Diferencia
              </div>
              <div className="font-mono font-bold tabular-nums">
                {money(diferencia)}
              </div>
            </div>
          </div>
        </div>
      </FormContainer>
    </div>
  );
}
