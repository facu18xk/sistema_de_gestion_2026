import type { TipoDepositoBancario } from "@/types/types";

export type ModoDeposito = "tercero" | "mismo_banco" | "efectivo" | "desconocido";

export function modoTipoDeposito(
  tipo: TipoDepositoBancario | undefined,
): ModoDeposito {
  const n =
    tipo?.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") ?? "";

  if (n.includes("efectivo")) return "efectivo";
  if (n.includes("tercero")) return "tercero";
  if (n.includes("mismo")) return "mismo_banco";
  return "desconocido";
}

export function nombreCliente(
  nombres: string,
  apellidos: string,
): string {
  return `${nombres} ${apellidos}`.trim();
}
