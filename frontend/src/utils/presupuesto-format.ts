/*ID Presupuesto = 1 -> PPTO-0001*/
export const formatearNumeroPresupuesto = (numero: number | string) => {
    return `PPTO-${String(numero).padStart(4, "0")}`
};