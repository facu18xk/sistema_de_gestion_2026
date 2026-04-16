export const API_CONFIG = {
    BASE_URL: "http://localhost:5066",
    ENDPOINTS: {
        LOGIN: "/api/Auth/iniciar",
        PRODUCTS: "/api/Productos",
        CATEGORIES: "/api/Categorias",
        BRANDS: "/api/Marcas"
    }
} as const;