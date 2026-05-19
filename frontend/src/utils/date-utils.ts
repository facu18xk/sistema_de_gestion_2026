//Compara la fechaVencimiento con la fecha actual
export const esPresupuestoVigente = (fechaVencimiento: string): boolean => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    return hoy <= vencimiento;
};

//Retorna la fecha como DD/MM/AAAA
export const formatearFecha = (fecha: string): string => {
    const formattedFecha = new Date(fecha).toLocaleDateString('es-PY');
    return formattedFecha;
}