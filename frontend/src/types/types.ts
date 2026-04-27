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

export interface ProductoFormState {
    descripcion: string;
    precioUnitario: number;
    esServicio: boolean;
    idMarca: string;
    idCategoria: string;
    porcentajeIva: string;
}


export interface Pais {
    idPais: number;
    nombre: string;
}

export interface Ciudad {
    idCiudad: number;
    nombre: string;
    idPais: number;
}

export interface Direccion {
    idDireccion?: number;
    calle1: string;
    calle2: string | null;
    descripcion: string | null;
    idCiudad: number;
    idPais: number; //para chequeo en edicion y creacion de proveedor
}

export interface Proveedor {
    idProveedor: number;
    ruc: string;
    razonSocial: string;
    nombreFantasia: string;
    idDireccion: number | null;
    direccion?: Direccion;
    nombres: string | null;
    apellidos: string | null;
    correo: string | null;
    telefono: string | null;
}


export interface PedidoItem {
  idPedidoCompraDetalle?: number
  idPedidoCompra?: number
  idProducto: number
  producto?: string
  categoria: string
  descripcion: string
  cantidad: number
  ultimoPrecio: number
}

export interface Pedido {
  id?: string
  nroPedido: string
  fecha: string
  estado: string
  items: PedidoItem[]
}

export interface PedidoDTO {
  idPedidoCompra: number
  idEstado: number
  estado: string
  numeroPedido: number
  fecha: string
}

export interface PedidoSaveDTO {
  idEstado: number
  numeroPedido: number
  fecha: string
}

export interface PedidoDetalleDTO {
  idPedidoCompraDetalle: number
  idPedidoCompra: number
  numeroPedidoCompra: number
  idProducto: number
  producto: string
  categoria: string
  descripcion: string
  cantidad: number
  ultimoPrecio: number
}

export interface PedidoDetalleSaveDTO {
  idPedidoCompra: number
  idProducto: number
  categoria: string
  descripcion: string
  cantidad: number
  ultimoPrecio: number
}