/** Filtra por rango de fechas (inputs type="date"). Si ambos están vacíos, no filtra. */
export function enRangoFecha(
  fechaIso: string,
  desde: string,
  hasta: string,
): boolean {
  if (!desde && !hasta) return true;

  const f = new Date(fechaIso);
  if (Number.isNaN(f.getTime())) return false;

  if (desde) {
    const d = new Date(`${desde}T00:00:00`);
    if (f < d) return false;
  }
  if (hasta) {
    const h = new Date(`${hasta}T23:59:59`);
    if (f > h) return false;
  }
  return true;
}

export function textoCoincide(
  query: string,
  ...campos: (string | number | null | undefined)[]
): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return campos.some((c) =>
    String(c ?? "")
      .toLowerCase()
      .includes(q),
  );
}

export function rangoFechaPorDefecto(): { desde: string; hasta: string } {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  return {
    desde: inicioMes.toISOString().split("T")[0],
    hasta: hoy.toISOString().split("T")[0],
  };
}
