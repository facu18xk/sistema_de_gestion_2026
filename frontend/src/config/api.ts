export const API_CONFIG = {
  BASE_URL: "https://sistemadegestion2026-production.up.railway.app",
  ENDPOINTS: {
    LOGIN: "/api/Auth/iniciar",
    PRODUCTS: "/api/Productos",
    CATEGORIES: "/api/Categorias",
    BRANDS: "/api/Marcas",
    PROVEEDORES: "/api/Proveedores",
    PAISES: "/api/Paises",
    CIUDADES: "/api/Ciudades",
    DIRECCIONES: "/api/Direcciones",
    CIUDADES_POR_PAIS: "/api/Ciudades/PorPais"
  },
} as const;
