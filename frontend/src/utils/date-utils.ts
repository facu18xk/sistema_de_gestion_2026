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

  // Creamos el objeto Date directamente. JavaScript parsea nativamente 
  // formatos ISO "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss.sssZ"
  const fechaEmision = new Date(fechaPago);
  
  // Validar si la fecha es inválida
  if (isNaN(fechaEmision.getTime())) {
    console.error("Error: El formato de fecha no es válido ->", fechaPago);
    return false;
  }

  const fechaActual = new Date();
  
  // Calculamos la diferencia real en milisegundos
  const diferenciaMilisegundos = fechaActual.getTime() - fechaEmision.getTime();
  const limite48HorasMs = 48 * 60 * 60 * 1000; // 172,800,000 ms

  // Es vigente si la diferencia es positiva (no es una fecha del futuro) 
  // y no supera las 48 horas exactas.
  return diferenciaMilisegundos >= 0 && diferenciaMilisegundos <= limite48HorasMs;
}

//Retorna la fecha como DD/MM/AAAA
export const formatearFecha = (fecha: string): string => {
    const formattedFecha = new Date(fecha).toLocaleDateString('es-PY');
    return formattedFecha;
}

/**
 * Suma una cantidad de días hábiles (lunes a viernes) a una fecha en formato YYYY-MM-DD
 * @param fechaString Fecha inicial en formato "YYYY-MM-DD"
 * @param diasHabiles Cantidad de días laborables a añadir
 * @returns string Fecha resultante en formato "YYYY-MM-DD"
 */
export function sumarDiasHabiles(fechaString: string, diasHabiles: number): string {
  // 1. Parsear año, mes y día para evitar el desfase de zona horaria UTC
  const [year, month, day] = fechaString.split('-').map(Number);
  
  // Creación de la fecha en hora local (00:00:00)
  const fecha = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  let diasContados = 0;

  // 2. Iterar avanzando un día a la vez hasta completar los días hábiles
  while (diasContados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    
    // `.getDay()` devuelve: 0 para Domingo, 6 para Sábado
    const diaSemana = fecha.getDay();
    
    // Si no es sábado (6) ni domingo (0), incrementamos el contador de días hábiles
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasContados++;
    }
  }

  // 3. Formatear el resultado manualmente a YYYY-MM-DD local
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
 
  return `${yyyy}-${mm}-${dd}`;
}