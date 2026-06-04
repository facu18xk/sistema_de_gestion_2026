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

// --- Dentro de types/types.ts ---

// Lo que viene dentro de la lista de categorías del proveedor en el GET
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

export interface PedidoDetalleDTO {
    idPedidoCompraDetalle: number;
    idPedidoCompra: number;
    numeroPedidoCompra: number;
    idProducto: number;
    producto: string;
    categoria: string;
    descripcion: string;
    cantidad: number;

}
export interface PedidoSaveDTO {
    idEstado: number;
    numeroPedido: number;
    fecha: string;
}

export interface PedidoDetalleSaveDTO {
    idPedidoCompra: number;
    idProducto: number;
    idCategoria: number;
    descripcion: string;
    cantidad: number;
}

export interface PedidoDetalleResponseDTO extends PedidoDetalleSaveDTO {
    idPedidoCompraDetalle: number;
    numeroPedidoCompra: number;
    producto: string;
    categoria: string;
}/**
 * ESTRUCTURA REAL SEGÚN SWAGGER DE PEDIDOS COTIZACIONES
 */

// Respuesta del GET /api/PedidosCotizaciones (Verificado en image_1ad382.png)
export interface CotizacionDTO {
    idPedidoCotizacion: number;
    idPedidoCompra: number;
    numeroPedidoCompra: number;
    idEstado: number;
    estado: string;
    idProveedor: number;
    proveedor: {
        idProveedor: number;
        ruc: string;
        razonSocial: string;
    };
    numeroPedido: number;
    fecha: string;
    validaHasta?: string;
}

// Cuerpo para el POST / PUT /api/PedidosCotizaciones (Verificado en image_1ad3dc.png)
export interface CotizacionSaveDTO {
    idPedidoCompra: number;
    idEstado: number;
    idProveedor: number;
    numeroPedido: number;
    fecha: string;
}

export interface CotizacionDetalleDTO {
    idPedidoCotizacionDetalle: number;
    idPedidoCotizacion: number;
    idProducto: number;
    idCategoria: number;
    descripcion: string;
    cantidad: number;
    precioProducto: number;
}

// El cuerpo exacto para el POST /api/PedidosCotizacionesDetalles
export interface CotizacionDetalleSaveDTO {
    idPedidoCotizacion: number;
    idProducto: number;
    idCategoria: number;
    descripcion: string;
    cantidad: number;
    precioProducto: number;
    descuento: number;
}

/**
 * ESTADO PARA EL FORMULARIO (Mantiene la UI del Frontend intacta)
 */
export interface CotizacionFormState {
    solicitudCotizacionId: string;
    proveedorId: string;
    fecha: string;
    validaHasta: string;
    idEstado: number;
    numeroPedido: number;
    items: CotizacionItemForm[];
}

export interface CotizacionItemForm {
    idDetalle?: number;
    productoId: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}

export interface OrdenCompraSaveDTO {
    idPedidoCotizacion: number
    idProveedor: number
    idEstado: number
    fecha: string
    descripcion: string
}

export interface OrdenCompraDTO {
    idOrdenCompra: number
    idPedidoCotizacion: number
    idProveedor: number
    proveedor: string
    idEstado: number
    estado: string
    fecha: string
    descripcion: string
    detalles: OrdenCompraDetalleDTO[]
}

export interface OrdenCompraDetalleSaveDTO {
    idOrdenCompraDetalle: number
    idOrdenCompra: number
    idProducto: number
    cantidad: number
}

export interface OrdenCompraDetalleDTO {
    idOrdenCompraDetalle: number
    idOrdenCompra: number
    idProducto: number
    cantidad: number
    producto: {
        idProducto: number
        nombre: string
    }
}
export interface FacturaCompra {
    idFacturaCompra: number
    idOrdenCompra: number
    ordenCompraDescripcion: string
    idProveedor: number
    proveedor: string
    nroComprobante: string
    timbrado: string
    fecha: string
    descripcion: string
    idEstado: number
    estado: string // "Pendiente" | "Pagado" | "Anulado"
    detalles: FacturaCompraDetalle[]
}

// Swagger Actualizado: POST todo junto (Cabecera + Detalles + Estado)
export interface FacturaCompraSaveDTO {
    idOrdenCompra: number
    idProveedor: number
    nroComprobante: string
    timbrado: string
    fecha: string
    descripcion: string
    idEstado: number
    detalles: FacturaCompraDetalleBulkDTO[]
}

export interface ProductoEmbed {
    idProducto: number
    descripcion: string
}

export interface FacturaCompraDetalle {
    idFacturaCompraDetalle: number
    idFacturaCompra: number
    idProducto: number
    cantidad: number
    precioUnitario: number
    totalBruto: number
    totalIva: number
    totalNeto: number
    producto: ProductoEmbed
}

// DTO para el envío masivo dentro del SaveDTO (sin ID de factura madre)
export interface FacturaCompraDetalleBulkDTO {
    idProducto: number
    cantidad: number
    precioUnitario: number
    totalBruto: number
    totalIva: number
    totalNeto: number
}

export interface OrdenPagoCompra {
    idOrdenPagoCompra: number;
    idProveedor: number;
    proveedor: string;
    idEstado: number;
    estado: string;
    fecha: string;
    descripcion: string;
    detalles?: OrdenPagoCompraDetalle[];
}

export interface OrdenPagoCompraDetalle {
    idOrdenPagoCompraDetalle: number;
    idOrdenPagoCompra: number;
    idFacturaCompra: number;
    monto: number;
    facturaCompra?: {
        idFacturaCompra: number;
        nro_Comprobante: string;
    };
}

export interface OrdenPagoCompraSaveDTO {
    idProveedor: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
}

export interface OrdenPagoCompraDetalleSaveDTO {
    idOrdenPagoCompra: number;
    idFacturaCompra: number;
    monto: number;
}

export interface MedioPagoLinea {
    tipo: "Efectivo" | "Cheque" | "Transferencia" | "Nota de Crédito";
    referencia: string;
    monto: number;
}

export interface ProductoNotaCreditoDetalleDTO {
    idProducto: number;
    descripcion: string;
}

export interface NotaCreditoCompraDetalleDTO {
    idNotaCreditoCompraDetalle: number;
    idNotaCreditoCompra: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    producto?: ProductoNotaCreditoDetalleDTO;
}

export interface NotaCreditoCompraDTO {
    idNotaCreditoCompra: number;
    idFacturaCompra: number;
    nroComprobanteFactura: string;
    idNotaDevolucionCompra: number;
    timbrado: string;
    motivo: string;
    fechaEmision: string;
    total: number;
    detalles: NotaCreditoCompraDetalleDTO[];
}

export interface NotaCreditoCompraSaveDTO {
    idFacturaCompra: number;
    idNotaDevolucionCompra: number;
    timbrado: string;
    motivo: string;
    fechaEmision: string;
    total: number;
}

export interface NotaCreditoCompraDetalleSaveDTO {
    idNotaCreditoCompra: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface NotaCreditoItemForm {
    idDetalle?: number;
    idProducto: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface NotaCreditoFormState {
    idFacturaCompra: string;
    idNotaDevolucionCompra: string;
    timbrado: string;
    motivo: string;
    fechaEmision: string;
    items: NotaCreditoItemForm[];
}
