"use client";

import { Combobox } from "@/components/shared/combobox";
import type { CuentaBancaria } from "@/types/types";

interface CuentaBancariaFilterComboboxProps {
  cuentas: CuentaBancaria[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

type CuentaBancariaFilterOption =
  | { type: "all"; value: "all" }
  | { type: "cuenta"; value: string; cuenta: CuentaBancaria };

const todasLasCuentasOption: CuentaBancariaFilterOption = {
  type: "all",
  value: "all",
};

function getCuentaMainText(cuenta: CuentaBancaria) {
  return `${cuenta.banco} - ${cuenta.numeroCuenta}`;
}

function getCuentaSecondaryText(cuenta: CuentaBancaria) {
  return `${cuenta.tipoCuentaBancaria} · ${cuenta.moneda}`;
}

function getOptionSearchText(option: CuentaBancariaFilterOption) {
  if (option.type === "all") return "Todas las cuentas";

  const { cuenta } = option;
  return [
    getCuentaMainText(cuenta),
    getCuentaSecondaryText(cuenta),
    cuenta.cuentaContable,
  ]
    .filter(Boolean)
    .join(" ");
}

function getOptionDisplayValue(option: CuentaBancariaFilterOption) {
  if (option.type === "all") return "Todas las cuentas";
  return getCuentaMainText(option.cuenta);
}

export function CuentaBancariaFilterCombobox({
  cuentas,
  value,
  onValueChange,
  className,
  disabled,
}: CuentaBancariaFilterComboboxProps) {
  const options: CuentaBancariaFilterOption[] = [
    todasLasCuentasOption,
    ...cuentas.map((cuenta) => ({
      type: "cuenta" as const,
      value: String(cuenta.idCuentaBancaria),
      cuenta,
    })),
  ];

  return (
    <Combobox
      value={value}
      items={options}
      onChange={(nextValue) => onValueChange(nextValue || "all")}
      getItemValue={(option) => option.value}
      getItemSearchText={getOptionSearchText}
      getItemDisplayValue={getOptionDisplayValue}
      placeholder="Todas las cuentas"
      emptyMessage="No hay cuentas que coincidan."
      maxItems={30}
      className={className}
      inputClassName="h-9 bg-white"
      disabled={disabled}
      renderItem={(option, active) =>
        option.type === "all" ? (
          <span className="truncate font-medium">Todas las cuentas</span>
        ) : (
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {getCuentaMainText(option.cuenta)}
            </span>
            <span
              className={
                active
                  ? "block truncate text-xs text-primary-foreground/80"
                  : "block truncate text-xs text-muted-foreground"
              }
            >
              {getCuentaSecondaryText(option.cuenta)}
            </span>
          </span>
        )
      }
    />
  );
}
