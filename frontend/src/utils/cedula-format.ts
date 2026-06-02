export const formatCI = (ci: string | number | null | undefined): string => {
  if (!ci) return "";
  const value = ci.toString().replace(/\D/g, "");
  return new Intl.NumberFormat("es-PY").format(parseInt(value));
};

export const formatRUC = (ruc: string | null | undefined): string => {
  if (!ruc) return "";
  let value = ruc.toString().replace(/\D/g, "");
  
  if (value.length < 2) return value;

  const dv = value.slice(-1); // El último dígito es el DV
  const cuerpo = value.slice(0, -1); // El resto es el número
  
  return `${new Intl.NumberFormat("es-PY").format(parseInt(cuerpo))}-${dv}`;
};

export const maskCIInput = (value: string): string => {
  const nums = value.replace(/\D/g, "");
  if (!nums) return "";
  // Limitamos a 8 dígitos que es el estándar de C.I.
  const limited = nums.slice(0, 8);
  return new Intl.NumberFormat("es-PY").format(parseInt(limited));
};

export const maskRUCInput = (value: string): string => {
  const nums = value.replace(/\D/g, "");
  if (!nums) return "";
  
  // El RUC en Paraguay puede ser corto o largo, pero siempre tiene 1 solo dígito verificador
  if (nums.length === 1) return nums;
  
  const cuerpo = nums.slice(0, -1);
  const dv = nums.slice(-1);
  
  const cuerpoFormateado = new Intl.NumberFormat("es-PY").format(parseInt(cuerpo));
  return `${cuerpoFormateado}-${dv}`;
};