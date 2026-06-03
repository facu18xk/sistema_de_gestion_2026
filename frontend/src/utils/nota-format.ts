/*ID Nota Crédito = 1 -> NC-0001*/
export const formatearNumeroNotaCredito = (numero: number | string) => {
    return `NC-${String(numero).padStart(4, "0")}`
};