/**
 * Formatea un número a moneda paraguaya (Gs.)
 * Ejemplo: 150000 -> 150.000 Gs.
 */
export const formatGuaranies = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0 ₲';

  return new Intl.NumberFormat('es-PY', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' ₲';
};

/**
 * Versión corta: solo el número con puntos (para inputs o tablas compactas)
 * Ejemplo: 150000 -> 150.000
 */
export const formatNumberDots = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};