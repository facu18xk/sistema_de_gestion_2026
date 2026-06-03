//Compara la fechaVencimiento con la fecha actual
export const esPresupuestoVigente = (fechaVencimiento: string): boolean => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    return hoy <= vencimiento;
};

/**
 * Verifica si una factura está dentro del rango de vigencia (48 horas desde su emisión)
 * para poder aplicarle una Nota de Crédito.
 * * @param fechaPago string en formato "YYYY-MM-DD" o un formato ISO válido
 * @returns boolean true si es vigente (menos de 48 horas), false en caso contrario
 */
export function esVigenteParaNotaCredito(fechaPago: string): boolean {
    if (!fechaPago) return false;
  const partes = fechaPago.match(/\d+/g);
  if (!partes || partes.length < 3) {
    console.error("Error: El formato de fecha no es válido ->", fechaPago);
    return false;
  }
  const year = Number(partes[0]);
  const month = Number(partes[1]);
  const day = Number(partes[2]);
  const fechaEmision = new Date(year, month - 1, day, 0, 0, 0, 0);
  const fechaActual = new Date();
  const hoyLimpio = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), 0, 0, 0, 0);
  const diferenciaMilisegundos = hoyLimpio.getTime() - fechaEmision.getTime();
  const limite48HorasMs = 48 * 60 * 60 * 1000;
  return diferenciaMilisegundos >= 0 && diferenciaMilisegundos <= limite48HorasMs;
}

//Retorna la fecha como DD/MM/AAAA
export const formatearFecha = (fecha: string): string => {
    const formattedFecha = new Date(fecha).toLocaleDateString('es-PY');
    return formattedFecha;
}