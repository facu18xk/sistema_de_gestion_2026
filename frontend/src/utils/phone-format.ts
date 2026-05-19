/**
 * FORMATEO PARA TABLAS / LISTAS (Solo lectura)
 * Transforma 0985123123 -> 0985-123-123
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  
  // Limpiamos cualquier cosa que no sea número
  const cleaned = phone.toString().replace(/\D/g, "");
  
  // Verificamos que tenga la longitud estándar de celular PY (10 dígitos)
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return cleaned; // Devolvemos el original limpio si no cumple el patrón
};

/**
 * MÁSCARA PARA INPUTS (Durante la escritura)
 * Maneja el tipeo dinámico para que los guiones aparezcan solos
 */
export const maskPhoneInput = (value: string): string => {
  if (!value) return "";
  
  // Solo permitimos números
  const nums = value.replace(/\D/g, "");
  const len = nums.length;

  // Limitamos a 10 dígitos (estándar celular PY)
  const limited = nums.slice(0, 10);

  if (len <= 4) {
    return limited;
  } else if (len <= 7) {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7, 10)}`;
  }
};