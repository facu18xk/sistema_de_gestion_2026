//Interfaces para Login/Auth
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    expiresAtUtc: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

//Interfaz para Productos
/*export interface Product {
    idProducto: number;
    descripcion: string | null;
    precioUnitario: number | null;
    esServicio: boolean;
    porcentajeIva: number;
    idMarca: number;
    marca: string | null;
    idCategoria: number;
    categoria: string | null;
}*/

// Lo que RECIBES del Backend (Lectura)
export interface ProductoDTO {
    idProducto: number;
    descripcion: string;
    precioUnitario: number;
    esServicio: boolean;
    porcentajeIva: number;
    cantidadTotal: number; // Stock sumado de todos los depósitos
    idMarca: number;
    marca: string;
    idCategoria: number;
    categoria: string;
}

// Lo que ENVÍAS al Backend (Escritura - Crear/Editar)
// Usamos Omit para quitar lo que el backend genera solo o lo que no se envía al insertar
export type ProductoSaveDTO = Omit<ProductoDTO, 'idProducto' | 'marca' | 'categoria' | 'cantidadTotal'>;

export interface Marca { 
    idMarca: number; 
    nombre: string 
}

export interface Categoria { 
    idCategoria: number; 
    nombre: string 
}