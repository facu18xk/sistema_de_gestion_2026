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

//Formato de aquellos endpoints tipo GET, donde <T> es el objeto.
export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface Marca {
    idMarca: number;
    nombre: string
}

export interface MarcaDTO {
    nombre: string;
}

export interface Categoria {
    idCategoria: number;
    nombre: string
}

export interface CategoriaDTO {
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

export interface Cliente {
    idCliente: number;
    ci: string;
    ruc: string;
    fechaNacimiento: string;
    idDireccion: number;
    direccion: Direccion;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
}

export interface ClienteSaveDTO {
    ci: string;
    ruc: string;
    fechaNacimiento: string;
    direccion: {
        calle1: string;
        calle2: string | null;
        descripcion: string | null;
        idCiudad: number;
    };
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
}

export interface Estado {
    idEstado: number;
    nombre: string;
}

//Ventas/Presupuestos
export interface PresupuestoItem {
    idProducto: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    iva: number;
    subtotal: number;
}

export interface PresupuestoItemSave {
    idProducto: number;
    cantidad: number;
}

export interface PresupuestoCabecera {
    idPresupuesto: number;
    idCliente: number;
    cliente: string;
    idEstado: number;
    estado: string;
    fecha: string;
    descripcion: string;
    fechaVencimiento: string;
}

export interface PresupuestoCabeceraSave {
    idCliente: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
    fechaVencimiento: string;
}

export interface PresupuestoCompleto {
    idPresupuesto: number;
    idCliente: number;
    cliente: string;
    idEstado: number;
    estado: string;
    fecha: string;
    descripcion: string;
    fechaVencimiento: string;
    items: PresupuestoItem[];
}

export interface PresupuestoCompletoSave {
    idCliente: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
    fechaVencimiento: string;
    items: PresupuestoItemSave[];
}

export interface PresupuestoDetalle {
    idPresupuestoDetalle: number;
    idPresupuesto: number;
    idProducto: number;
    cantidad: number;
    iva: number;
    subtotal: number;
}

export interface PreciosVentas {
    idPrecioVenta: number;
    idProducto: number;
    producto: string;
    precioCompraBase: number;
    porcentajeGanancia: number;
    precioVenta: number;
    activo: boolean;
    fechaDesde: string;
    fechaHasta: string;
}

export interface ProveedorCategoriaDTO {
    idCategoria: number;
    categoria: string;
}

export interface Proveedor {
    idProveedor: number;
    ruc: string;
    razonSocial: string;
    nombreFantasia: string;
    idDireccion: number;
    direccion: Direccion;
    nombres: string | null;
    apellidos: string | null;
    correo: string | null;
    telefono: string | null;
    categorias: ProveedorCategoriaDTO[];
}

export interface ProveedorSaveDTO {
    ruc: string;
    razonSocial: string;
    nombreFantasia: string;
    direccion: {
        calle1: string;
        calle2: string | null;
        descripcion: string | null;
        idCiudad: number;

    };
    nombres: string | null;
    apellidos: string | null;
    correo: string | null;
    telefono: string | null;
    categoriaIds: number[];
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
}

export interface PedidoDetalleSaveDTO {
  idPedidoCompra: number
  idProducto: number
  categoria: string
  descripcion: string
  cantidad: number
}