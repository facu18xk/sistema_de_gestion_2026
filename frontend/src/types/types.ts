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
export interface Product {
    idProducto: number;
    descripcion: string | null;
    precioUnitario: number | null;
    esServicio: boolean;
    porcentajeIva: number;
    idMarca: number;
    marca: string | null;
    idCategoria: number;
    categoria: string | null;
}