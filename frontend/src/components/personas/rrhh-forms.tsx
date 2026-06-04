"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Cargo,
  CargoSaveDTO,
  ConceptoSalario,
  ConceptoSalarioSaveDTO,
  Empleado,
  EmpleadoCargo,
  EmpleadoCargoSaveDTO,
  EmpleadoConceptoMensual,
  EmpleadoConceptoMensualSaveDTO,
  ParametroSalario,
  ParametroSalarioSaveDTO,
} from "@/types/types";

const noValue = "__none__";

function empleadoLabel(empleado: Empleado) {
  return `${empleado.nombres} ${empleado.apellidos}`.trim();
}

function dateValue(value?: string | null) {
  return value ? value.substring(0, 10) : "";
}

function SwitchField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="size-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

export function CargoForm({
  cargoEditado,
  onSubmit,
  onCancel,
}: {
  cargoEditado?: Cargo | null;
  onSubmit: (data: CargoSaveDTO) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CargoSaveDTO>({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  useEffect(() => {
    setFormData({
      nombre: cargoEditado?.nombre ?? "",
      descripcion: cargoEditado?.descripcion ?? "",
      activo: cargoEditado?.activo ?? true,
    });
  }, [cargoEditado]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        descripcion: formData.descripcion?.trim() || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
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

      <SwitchField
        label="Activo"
        checked={formData.activo}
        onChange={(activo) => setFormData((prev) => ({ ...prev, activo }))}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={cargoEditado ? "Actualizar cargo" : "Guardar cargo"}
        onCancel={onCancel}
      />
    </form>
  );
}

export function EmpleadoCargoForm({
  registroEditado,
  empleados,
  cargos,
  onSubmit,
  onCancel,
}: {
  registroEditado?: EmpleadoCargo | null;
  empleados: Empleado[];
  cargos: Cargo[];
  onSubmit: (data: EmpleadoCargoSaveDTO) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idEmpleado: "",
    idCargo: "",
    fechaDesde: "",
    fechaHasta: "",
    activo: true,
  });

  const empleadosOrdenados = useMemo(
    () =>
      [...empleados].sort((a, b) =>
        empleadoLabel(a).localeCompare(empleadoLabel(b), "es"),
      ),
    [empleados],
  );

  const cargosOrdenados = useMemo(
    () => [...cargos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [cargos],
  );

  useEffect(() => {
    setFormData({
      idEmpleado: registroEditado?.idEmpleado?.toString() ?? "",
      idCargo: registroEditado?.idCargo?.toString() ?? "",
      fechaDesde: dateValue(registroEditado?.fechaDesde),
      fechaHasta: dateValue(registroEditado?.fechaHasta),
      activo: registroEditado?.activo ?? true,
    });
  }, [registroEditado]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        idEmpleado: Number(formData.idEmpleado),
        idCargo: Number(formData.idCargo),
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta || null,
        activo: formData.activo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <SelectField
        label="Empleado"
        value={formData.idEmpleado}
        placeholder="Seleccionar empleado"
        options={empleadosOrdenados.map((empleado) => ({
          value: empleado.idEmpleado.toString(),
          label: empleadoLabel(empleado),
        }))}
        onChange={(idEmpleado) =>
          setFormData((prev) => ({ ...prev, idEmpleado }))
        }
      />

      <SelectField
        label="Cargo"
        value={formData.idCargo}
        placeholder="Seleccionar cargo"
        options={cargosOrdenados.map((cargo) => ({
          value: cargo.idCargo.toString(),
          label: cargo.nombre,
        }))}
        onChange={(idCargo) => setFormData((prev) => ({ ...prev, idCargo }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Desde"
          value={formData.fechaDesde}
          onChange={(fechaDesde) =>
            setFormData((prev) => ({ ...prev, fechaDesde }))
          }
          required
        />
        <DateInput
          label="Hasta"
          value={formData.fechaHasta}
          onChange={(fechaHasta) =>
            setFormData((prev) => ({ ...prev, fechaHasta }))
          }
        />
      </div>

      <SwitchField
        label="Cargo vigente"
        checked={formData.activo}
        onChange={(activo) => setFormData((prev) => ({ ...prev, activo }))}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={
          registroEditado ? "Actualizar asignación" : "Guardar asignación"
        }
        onCancel={onCancel}
      />
    </form>
  );
}

export function ConceptoSalarioForm({
  conceptoEditado,
  onSubmit,
  onCancel,
}: {
  conceptoEditado?: ConceptoSalario | null;
  onSubmit: (data: ConceptoSalarioSaveDTO) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ConceptoSalarioSaveDTO>({
    codigo: "",
    descripcion: "",
    tipo: "Ingreso",
    deducibleIps: false,
    esSalarioBase: false,
    esIps: false,
    esBonificacionFamiliar: false,
    activo: true,
  });

  useEffect(() => {
    setFormData({
      codigo: conceptoEditado?.codigo ?? "",
      descripcion: conceptoEditado?.descripcion ?? "",
      tipo: conceptoEditado?.tipo ?? "Ingreso",
      deducibleIps: conceptoEditado?.deducibleIps ?? false,
      esSalarioBase: conceptoEditado?.esSalarioBase ?? false,
      esIps: conceptoEditado?.esIps ?? false,
      esBonificacionFamiliar: conceptoEditado?.esBonificacionFamiliar ?? false,
      activo: conceptoEditado?.activo ?? true,
    });
  }, [conceptoEditado]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        deducibleIps: formData.tipo === "Ingreso" && formData.deducibleIps,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
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

        <SelectField
          label="Tipo"
          value={formData.tipo}
          placeholder="Tipo"
          options={[
            { value: "Ingreso", label: "Ingreso" },
            { value: "Egreso", label: "Egreso" },
          ]}
          onChange={(tipo) =>
            setFormData((prev) => ({
              ...prev,
              tipo,
              deducibleIps: tipo === "Ingreso" ? prev.deducibleIps : false,
            }))
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(event) =>
            setFormData((prev) => ({
              ...prev,
              descripcion: event.target.value,
            }))
          }
          required
        />
      </div>

      <div className="grid gap-2">
        <SwitchField
          label="Deducible de IPS"
          checked={formData.deducibleIps}
          disabled={formData.tipo !== "Ingreso"}
          onChange={(deducibleIps) =>
            setFormData((prev) => ({ ...prev, deducibleIps }))
          }
        />
        <SwitchField
          label="Concepto salario base"
          checked={formData.esSalarioBase}
          onChange={(esSalarioBase) =>
            setFormData((prev) => ({ ...prev, esSalarioBase }))
          }
        />
        <SwitchField
          label="Concepto IPS"
          checked={formData.esIps}
          onChange={(esIps) => setFormData((prev) => ({ ...prev, esIps }))}
        />
        <SwitchField
          label="Bonificación familiar"
          checked={formData.esBonificacionFamiliar}
          onChange={(esBonificacionFamiliar) =>
            setFormData((prev) => ({ ...prev, esBonificacionFamiliar }))
          }
        />
        <SwitchField
          label="Activo"
          checked={formData.activo}
          onChange={(activo) => setFormData((prev) => ({ ...prev, activo }))}
        />
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={conceptoEditado ? "Actualizar concepto" : "Guardar concepto"}
        onCancel={onCancel}
      />
    </form>
  );
}

export function ParametroSalarioForm({
  parametroEditado,
  onSubmit,
  onCancel,
}: {
  parametroEditado?: ParametroSalario | null;
  onSubmit: (data: ParametroSalarioSaveDTO) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fechaDesde: "",
    fechaHasta: "",
    salarioMinimo: "",
    porcentajeIpsEmpleado: "9",
    porcentajeBonificacionFamiliar: "5",
    activo: true,
  });

  useEffect(() => {
    setFormData({
      fechaDesde: dateValue(parametroEditado?.fechaDesde),
      fechaHasta: dateValue(parametroEditado?.fechaHasta),
      salarioMinimo: parametroEditado?.salarioMinimo?.toString() ?? "",
      porcentajeIpsEmpleado:
        parametroEditado?.porcentajeIpsEmpleado?.toString() ?? "9",
      porcentajeBonificacionFamiliar:
        parametroEditado?.porcentajeBonificacionFamiliar?.toString() ?? "5",
      activo: parametroEditado?.activo ?? true,
    });
  }, [parametroEditado]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta || null,
        salarioMinimo: Number(formData.salarioMinimo),
        porcentajeIpsEmpleado: Number(formData.porcentajeIpsEmpleado),
        porcentajeBonificacionFamiliar: Number(
          formData.porcentajeBonificacionFamiliar,
        ),
        activo: formData.activo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Desde"
          value={formData.fechaDesde}
          onChange={(fechaDesde) =>
            setFormData((prev) => ({ ...prev, fechaDesde }))
          }
          required
        />
        <DateInput
          label="Hasta"
          value={formData.fechaHasta}
          onChange={(fechaHasta) =>
            setFormData((prev) => ({ ...prev, fechaHasta }))
          }
        />
      </div>

      <NumberInput
        label="Salario mínimo"
        value={formData.salarioMinimo}
        onChange={(salarioMinimo) =>
          setFormData((prev) => ({ ...prev, salarioMinimo }))
        }
        min={0}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="% IPS empleado"
          value={formData.porcentajeIpsEmpleado}
          onChange={(porcentajeIpsEmpleado) =>
            setFormData((prev) => ({ ...prev, porcentajeIpsEmpleado }))
          }
          min={0}
          step="0.01"
          required
        />
        <NumberInput
          label="% bonificación familiar"
          value={formData.porcentajeBonificacionFamiliar}
          onChange={(porcentajeBonificacionFamiliar) =>
            setFormData((prev) => ({
              ...prev,
              porcentajeBonificacionFamiliar,
            }))
          }
          min={0}
          step="0.01"
          required
        />
      </div>

      <SwitchField
        label="Activo"
        checked={formData.activo}
        onChange={(activo) => setFormData((prev) => ({ ...prev, activo }))}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={
          parametroEditado ? "Actualizar parámetro" : "Guardar parámetro"
        }
        onCancel={onCancel}
      />
    </form>
  );
}

export function EmpleadoConceptoMensualForm({
  registroEditado,
  empleados,
  conceptos,
  onSubmit,
  onCancel,
}: {
  registroEditado?: EmpleadoConceptoMensual | null;
  empleados: Empleado[];
  conceptos: ConceptoSalario[];
  onSubmit: (data: EmpleadoConceptoMensualSaveDTO) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idEmpleado: "",
    idConceptoSalario: "",
    monto: "",
    fechaDesde: "",
    fechaHasta: "",
    activo: true,
  });

  const empleadosOrdenados = useMemo(
    () =>
      [...empleados].sort((a, b) =>
        empleadoLabel(a).localeCompare(empleadoLabel(b), "es"),
      ),
    [empleados],
  );

  const conceptosOrdenados = useMemo(
    () =>
      [...conceptos].sort((a, b) =>
        a.descripcion.localeCompare(b.descripcion, "es"),
      ),
    [conceptos],
  );

  useEffect(() => {
    setFormData({
      idEmpleado: registroEditado?.idEmpleado?.toString() ?? "",
      idConceptoSalario:
        registroEditado?.idConceptoSalario?.toString() ?? "",
      monto: registroEditado?.monto?.toString() ?? "",
      fechaDesde: dateValue(registroEditado?.fechaDesde),
      fechaHasta: dateValue(registroEditado?.fechaHasta),
      activo: registroEditado?.activo ?? true,
    });
  }, [registroEditado]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        idEmpleado: Number(formData.idEmpleado),
        idConceptoSalario: Number(formData.idConceptoSalario),
        monto: Number(formData.monto),
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta || null,
        activo: formData.activo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 text-sm">
      <SelectField
        label="Empleado"
        value={formData.idEmpleado}
        placeholder="Seleccionar empleado"
        options={empleadosOrdenados.map((empleado) => ({
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
        options={conceptosOrdenados.map((concepto) => ({
          value: concepto.idConceptoSalario.toString(),
          label: `${concepto.codigo} - ${concepto.descripcion}`,
        }))}
        onChange={(idConceptoSalario) =>
          setFormData((prev) => ({ ...prev, idConceptoSalario }))
        }
      />

      <NumberInput
        label="Monto"
        value={formData.monto}
        onChange={(monto) => setFormData((prev) => ({ ...prev, monto }))}
        min={0}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Desde"
          value={formData.fechaDesde}
          onChange={(fechaDesde) =>
            setFormData((prev) => ({ ...prev, fechaDesde }))
          }
          required
        />
        <DateInput
          label="Hasta"
          value={formData.fechaHasta}
          onChange={(fechaHasta) =>
            setFormData((prev) => ({ ...prev, fechaHasta }))
          }
        />
      </div>

      <SwitchField
        label="Activo"
        checked={formData.activo}
        onChange={(activo) => setFormData((prev) => ({ ...prev, activo }))}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={
          registroEditado ? "Actualizar concepto mensual" : "Guardar concepto mensual"
        }
        onCancel={onCancel}
      />
    </form>
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

function DateInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  step = "1",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select
        value={value || noValue}
        onValueChange={(nextValue) => onChange(nextValue === noValue ? "" : nextValue)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[320px]">
          <SelectItem value={noValue} disabled>
            {placeholder}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
