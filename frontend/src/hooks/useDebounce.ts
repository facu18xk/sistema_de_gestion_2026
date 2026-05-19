import { useEffect, useState } from 'react';

/**
 * Hook para retrasar la actualización de un valor hasta que haya pasado 
 * un tiempo determinado desde la última vez que cambió.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecemos un temporizador para actualizar el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el valor cambia antes de que termine el tiempo, limpiamos el timer anterior
    // Esto es lo que evita que se disparen 50 peticiones a la API mientras escribes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}