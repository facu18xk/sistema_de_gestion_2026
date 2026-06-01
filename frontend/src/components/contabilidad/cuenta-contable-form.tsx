"use client";

import { useEffect, useMemo, useState } from "react";
import { FieldWrapper } from "@/components/FieldWrapper";
import { FormContainer } from "@/components/FormContainer";
import { Input } from "@/components/ui/input";
import { formatProcesoContable } from "@/components/contabilidad/contabilidad-process-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CuentaContableDTO,
  ProcesoContableDTO,
  TipoCuentaContable,
} from "@/types/types";

const tiposCuenta: TipoCuentaContable[] = [
  "Activo",
  "Pasivo",
  "Patrimonio",
  "Ingreso",
  "Gasto",
];
const SIN_PADRE = "sin-padre";

interface Props {
  cuentaEditada?: CuentaContableDTO | null;
  proceso: ProcesoContableDTO | null;
  cuentas: CuentaContableDTO[];
  onSubmit: (
    data: Omit<CuentaContableDTO, "idCuentaContable" | "cuentaPadre">,
  ) => void;
  onCancel: () => void;
}

interface FormState {
  idProcesoContable: string;
  idCuentaPadre: string;
  numeroCuenta: string;
  nombre: string;
  tipoCuenta: TipoCuentaContable;
  esAsentable: boolean;
  activa: boolean;
}

type CuentaPadreOption = CuentaContableDTO & {
  depth: number;
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

function buildDepthByCuenta(cuentas: CuentaContableDTO[]) {
  const cuentasById = new Map<number, CuentaContableDTO>();
  const depthByCuenta = new Map<number, number>();

  cuentas.forEach((cuenta) => {
    cuentasById.set(cuenta.idCuentaContable, cuenta);
  });

  const getDepth = (
    cuenta: CuentaContableDTO,
    visiting = new Set<number>(),
  ): number => {
    if (depthByCuenta.has(cuenta.idCuentaContable)) {
      return depthByCuenta.get(cuenta.idCuentaContable) ?? 0;
    }

    if (!cuenta.idCuentaPadre || visiting.has(cuenta.idCuentaContable)) {
      depthByCuenta.set(cuenta.idCuentaContable, 0);
      return 0;
    }

    const parent = cuentasById.get(cuenta.idCuentaPadre);
    if (!parent) {
      depthByCuenta.set(cuenta.idCuentaContable, 0);
      return 0;
    }

    visiting.add(cuenta.idCuentaContable);
    const depth = getDepth(parent, visiting) + 1;
    visiting.delete(cuenta.idCuentaContable);
    depthByCuenta.set(cuenta.idCuentaContable, depth);
    return depth;
  };

  cuentas.forEach((cuenta) => getDepth(cuenta));

  return depthByCuenta;
}

export function CuentaContableForm({
  cuentaEditada,
  proceso,
  cuentas,
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<FormState>({
    idProcesoContable: proceso ? String(proceso.idProcesoContable) : "",
    idCuentaPadre: SIN_PADRE,
    numeroCuenta: "",
    nombre: "",
    tipoCuenta: "Activo",
    esAsentable: false,
    activa: true,
  });

  useEffect(() => {
    setFormData({
      idProcesoContable: String(
        cuentaEditada?.idProcesoContable ?? proceso?.idProcesoContable ?? "",
      ),
      idCuentaPadre: cuentaEditada?.idCuentaPadre
        ? String(cuentaEditada.idCuentaPadre)
        : SIN_PADRE,
      numeroCuenta: cuentaEditada?.numeroCuenta ?? cuentaEditada?.codigo ?? "",
      nombre: cuentaEditada?.nombre ?? "",
      tipoCuenta: tiposCuenta.includes(
        cuentaEditada?.tipoCuenta as TipoCuentaContable,
      )
        ? (cuentaEditada?.tipoCuenta as TipoCuentaContable)
        : "Activo",
      esAsentable: cuentaEditada?.esAsentable ?? false,
      activa: cuentaEditada?.activa ?? true,
    });
  }, [cuentaEditada, proceso]);

  const depthByCuenta = useMemo(() => buildDepthByCuenta(cuentas), [cuentas]);

  const idsDescendientesCuentaEditada = useMemo(() => {
    if (!cuentaEditada) return new Set<number>();

    const childrenByParent = new Map<number, CuentaContableDTO[]>();
    cuentas.forEach((cuenta) => {
      if (!cuenta.idCuentaPadre) return;
      const siblings = childrenByParent.get(cuenta.idCuentaPadre) ?? [];
      siblings.push(cuenta);
      childrenByParent.set(cuenta.idCuentaPadre, siblings);
    });

    const descendants = new Set<number>();
    const appendDescendants = (parentId: number) => {
      const children = childrenByParent.get(parentId) ?? [];
      children.forEach((child) => {
        descendants.add(child.idCuentaContable);
        appendDescendants(child.idCuentaContable);
      });
    };

    appendDescendants(cuentaEditada.idCuentaContable);
    return descendants;
  }, [cuentaEditada, cuentas]);

  const hasChildren = useMemo(
    () =>
      cuentaEditada
        ? cuentas.some(
            (cuenta) =>
              cuenta.idCuentaPadre === cuentaEditada.idCuentaContable,
          )
        : false,
    [cuentaEditada, cuentas],
  );

  const maxParentDepth = proceso?.cantNiveles ? proceso.cantNiveles - 2 : null;
  const selectedParent = cuentas.find(
    (cuenta) => String(cuenta.idCuentaContable) === formData.idCuentaPadre,
  );
  const selectedParentDepth =
    formData.idCuentaPadre === SIN_PADRE || !selectedParent
      ? -1
      : depthByCuenta.get(selectedParent.idCuentaContable) ?? 0;
  const nextAccountLevel = selectedParentDepth + 2;
  const maxAccountLevel = proceso?.cantNiveles ?? null;

  const cuentasPadre = useMemo<CuentaPadreOption[]>(
    () =>
      cuentas
        .filter(
          (cuenta) =>
            cuenta.idProcesoContable === Number(formData.idProcesoContable) &&
            cuenta.tipoCuenta === formData.tipoCuenta &&
            cuenta.idCuentaContable !== cuentaEditada?.idCuentaContable &&
            !idsDescendientesCuentaEditada.has(cuenta.idCuentaContable) &&
            !cuenta.esAsentable &&
            (maxParentDepth === null ||
              (depthByCuenta.get(cuenta.idCuentaContable) ?? 0) <=
                maxParentDepth),
        )
        .sort(sortCuentas)
        .map((cuenta) => ({
          ...cuenta,
          depth: depthByCuenta.get(cuenta.idCuentaContable) ?? 0,
        })),
    [
      cuentas,
      cuentaEditada,
      depthByCuenta,
      formData.idProcesoContable,
      formData.tipoCuenta,
      idsDescendientesCuentaEditada,
      maxParentDepth,
    ],
  );

  useEffect(() => {
    if (formData.idCuentaPadre === SIN_PADRE) return;

    const parentStillValid = cuentasPadre.some(
      (cuenta) => String(cuenta.idCuentaContable) === formData.idCuentaPadre,
    );

    if (!parentStillValid) {
      setFormData((prev) => ({ ...prev, idCuentaPadre: SIN_PADRE }));
    }
  }, [cuentasPadre, formData.idCuentaPadre]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <FormContainer
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          idProcesoContable: Number(formData.idProcesoContable),
          idCuentaPadre:
            formData.idCuentaPadre === SIN_PADRE
              ? null
              : Number(formData.idCuentaPadre),
          numeroCuenta: formData.numeroCuenta.trim(),
          codigo: formData.numeroCuenta.trim(),
          nombre: formData.nombre.trim(),
          tipoCuenta: formData.tipoCuenta,
          esAsentable: hasChildren ? false : formData.esAsentable,
          activa: formData.activa,
        });
      }}
      onCancel={onCancel}
      isEditing={!!cuentaEditada}
      submitText={{ save: "Guardar", update: "Actualizar" }}
      submitDisabled={!formData.idProcesoContable}
    >
      <div className="grid gap-4">
        <FieldWrapper id="proceso" label="Proceso">
          <Input
            id="proceso"
            value={proceso ? formatProcesoContable(proceso) : "Seleccione un proceso"}
            readOnly
            className="bg-gray-100"
          />
        </FieldWrapper>

        <FieldWrapper id="tipoCuenta" label="Tipo cuenta">
          <Select
            value={formData.tipoCuenta}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                tipoCuenta: value as TipoCuentaContable,
                idCuentaPadre: SIN_PADRE,
              }));
            }}
          >
            <SelectTrigger id="tipoCuenta" className="h-9 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiposCuenta.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>

        <FieldWrapper id="idCuentaPadre" label="Cuenta padre">
          <Select
            value={formData.idCuentaPadre}
            onValueChange={(value) => updateField("idCuentaPadre", value)}
          >
            <SelectTrigger id="idCuentaPadre" className="h-9 w-full rounded-md">
              <SelectValue placeholder="Sin cuenta padre" />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-72">
              <SelectItem value={SIN_PADRE}>Sin cuenta padre</SelectItem>
              {cuentasPadre.map((cuenta) => (
                <SelectItem
                  key={cuenta.idCuentaContable}
                  value={String(cuenta.idCuentaContable)}
                  className="h-8"
                >
                  <span
                    className="flex min-w-0 items-center gap-2"
                    style={{ paddingLeft: `${cuenta.depth * 16}px` }}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {getCuentaCodigo(cuenta) || "Sin código"}
                    </span>
                    <span className="truncate">{cuenta.nombre}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            {cuentasPadre.length > 0
              ? `Mostrando ${cuentasPadre.length} cuentas ${formData.tipoCuenta.toLowerCase()} válidas para el nivel ${nextAccountLevel}${maxAccountLevel ? ` de ${maxAccountLevel}` : ""}.`
              : `No hay cuentas ${formData.tipoCuenta.toLowerCase()} disponibles como padre.`}
          </p>
        </FieldWrapper>

        <FieldWrapper id="numeroCuenta" label="Número / Código">
          <Input
            id="numeroCuenta"
            value={formData.numeroCuenta}
            onChange={(event) => updateField("numeroCuenta", event.target.value)}
            required
          />
        </FieldWrapper>

        <FieldWrapper id="nombre" label="Nombre">
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(event) => updateField("nombre", event.target.value)}
            required
          />
        </FieldWrapper>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasChildren ? false : formData.esAsentable}
            onChange={(event) =>
              updateField("esAsentable", event.target.checked)
            }
            disabled={hasChildren}
            className="size-4"
          />
          Es asentable
        </label>
        {hasChildren && (
          <p className="-mt-3 text-xs text-muted-foreground">
            Una cuenta con subcuentas no puede marcarse como asentable.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.activa}
            onChange={(event) => updateField("activa", event.target.checked)}
            className="size-4"
          />
          Activa
        </label>
      </div>
    </FormContainer>
  );
}
