/*ID Factura = 1 -> FRA-0001*/
export const formatearNumeroFactura = (numero: number | string) => {
    return `FRA-${String(numero).padStart(4, "0")}`
};