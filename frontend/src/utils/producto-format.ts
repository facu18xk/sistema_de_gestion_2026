/*ID Producto = 1 -> Formatea a Prod-0001 */
export const formatearNumeroProducto = (numero: number | string) => {
    return `Prod-${String(numero).padStart(4, "0")}`
};