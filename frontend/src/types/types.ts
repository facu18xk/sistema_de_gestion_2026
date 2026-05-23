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

export interface FacturaVentaItem {
    idProducto: number;
    cantidad: number;
}

export interface FacturaVentaCompleto {
    idFacturaVenta: number;
    idOrdenVenta: number;
    ordenVentaDescripcion: string;
    idCliente: number;
    cliente: string;
    nroComprobante: string;
    idTimbrado: number;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    medioPagoCompra: string;
    fechaPago: string;
    items: FacturaVentaItem[];
}

export interface FacturaVentaCompletoSave {
    idOrdenVenta: number;
    idCliente: number;
    nroComprobante: string;
    idTimbrado: number;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    fechaPago: string;
    items: FacturaVentaItem[];
}

export interface FacturaVentaCabecera {
    idFacturaVenta: number;
    idOrdenVenta: number;
    ordenVentaDescripcion: string;
    idCliente: number;
    cliente: string;
    nroComprobante: string;
    idTimbrado: number;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    medioPagoCompra: string;
    fechaPago: string;
}

export interface OrdenVenta {
    idOrdenVenta: number;
    idPresupuesto: number;
    presupuestoDescripción: string;
    idCliente: number;
    cliente: string;
    idEstado: number;
    estado: string;
    fecha: string;
    descripcion: string;
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

export interface ProcesoContableDTO {
    idProcesoContable: number
    periodoAnho: number
    descripcion: string
    cantNiveles: number
    cantDigitosNivel: number
    moneda: string
    estado: string

    tienePeriodos?: boolean;
}

export interface ProcesoContableSaveDTO {
    periodoAnho: number
    descripcion: string
    cantNiveles: number
    cantDigitosNivel: number
    moneda: string
}

export interface PeriodoContableDTO {
    idPeriodoContable: number
    idProcesoContable: number
    procesoContable: string
    anho: number
    mes: number
    fechaInicio: string
    fechaFin: string
    estado: string
}

export interface PeriodoContableSaveDTO {
    idProcesoContable: number
    anho: number
    mes: number
    fechaInicio: string
    fechaFin: string
    estado: string
}

export type TipoCuentaContable =
    | "Activo"
    | "Pasivo"
    | "Patrimonio"
    | "Ingreso"
    | "Gasto"

export type TipoMovimientoAsiento = "Debe" | "Haber"

export interface CuentaContableDTO {
    idCuentaContable: number
    idProcesoContable: number
    idCuentaPadre?: number | null
    numeroCuenta?: string
    codigo?: string
    nombre: string
    tipoCuenta: TipoCuentaContable | string
    esAsentable: boolean
    activa: boolean
    cuentaPadre?: string | null
}

export interface AsientoDetalleDTO {
    idAsientoDetalle?: number
    idAsiento?: number
    item: number
    idCuentaContable: number
    cuentaContable?: string
    numeroAsiento?: number
    descripcionItem?: string | null
    tipoMovimiento: TipoMovimientoAsiento
    monto: number
}

export interface AsientoDTO {
    idAsiento: number
    idPeriodoContable?: number | null
    periodoContable?: string | null
    idModulo?: number | null
    modulo?: string | null
    numeroAsiento: number
    fecha: string
    descripcion?: string | null
    estado: string
    automatico: boolean
    referenciaOrigen?: string | null
    idOrigen?: number | null
    createdAt?: string | null
    fechaMayorizacion?: string | null
}

export interface AsientoCompletoPayloadDTO {
    idModulo: number | null
    fecha: string
    descripcion?: string | null
    automatico: boolean
    estado: string
    referenciaOrigen?: string | null
    idOrigen?: number | null
    createdAt?: string | null
    fechaMayorizacion?: string | null
    detalles: AsientoDetalleDTO[]
}

export interface AsientoCompletoDTO {
    asiento: AsientoDTO
    detalles: AsientoDetalleDTO[]
}

export interface Empleado {
    idEmpleado: number
    ci: string
    ruc: string
    fechaIngreso: string
    idDireccion: number
    direccion: Direccion
    nombres: string
    apellidos: string
    correo: string
    telefono: string
}

export interface EmpleadoSaveDTO {
    ci: string
    ruc: string
    fechaIngreso: string
    direccion: {
        calle1: string
        calle2: string | null
        descripcion: string | null
        idPais: number
        idCiudad: number
    }
    nombres: string
    apellidos: string
    correo: string
    telefono: string
}

export interface EmpleadoFormState {
    ci: string
    ruc: string
    fechaIngreso: string
    nombres: string
    apellidos: string
    correo: string
    telefono: string

    idPais: string
    idCiudad: string

    calle1: string
    calle2: string
    descripcionDireccion: string
}

export interface Pariente {
    idPariente: number
    idEmpleado: number
    tipoRelacion: string
    edad: number
    fechaNacimiento: string

    empleado: {
        idEmpleado: number
        nombres: string
        apellidos: string
    }
}

export interface ParienteSaveDTO {
    idEmpleado: number
    tipoRelacion: string
    edad: number
    fechaNacimiento: string
}

export interface ParienteFormState {
    idEmpleado: string
    tipoRelacion: string
    edad: string
    fechaNacimiento: string
}

export interface CotizacionDTO {
    idPedidoCotizacion: number
    idPedidoCompra: number
    idEstado: number
    idProveedor: number
    numeroPedido: number
    fecha: string
    validaHasta?: string | null
    estado?: string
    proveedor?: Proveedor
}

export interface CotizacionSaveDTO {
    idPedidoCompra: number
    idEstado: number
    idProveedor: number
    numeroPedido: number
    fecha: string
}

export interface CotizacionDetalleDTO {
    idPedidoCotizacionDetalle: number
    idPedidoCotizacion: number
    idProducto: number
    idCategoria: number
    descripcion: string
    cantidad: number
    precioProducto: number
    descuento: number
}

export interface CotizacionDetalleSaveDTO {
    idPedidoCotizacion: number
    idProducto: number
    idCategoria: number
    descripcion: string
    cantidad: number
    precioProducto: number
    descuento: number
}

export interface CotizacionItemForm {
    idDetalle?: number;
    productoId: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}

export interface CotizacionFormState {
    solicitudCotizacionId: string
    proveedorId: string
    fecha: string
    validaHasta: string
    idEstado: number
    numeroPedido: number
    items: CotizacionItemForm[]
}


export type EstadoProcesoContable =
    | "Habilitado"
    | "Abierto"
    | "Activo"
    | "Activa"
    | "Registrado"
    | "Registrada"
    | "Cerrado"
    | "Cerrada"
    | "Inhabilitado"
    | "Inhabilitada"
