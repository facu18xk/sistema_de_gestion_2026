//Interfaces para Login/Auth
export type UserRole = "ADMIN" | "USER";

/** Datos que devuelve la API al iniciar sesión */
export interface AuthUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

/** Usuario en sesión (frontend agrega el rol) */
export interface User extends AuthUser {
    role: UserRole;
}

export interface LoginResponse {
    token: string;
    expiresAtUtc: string;
    user: AuthUser;
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
    cantidadTotal: number;
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
    estado?: string;
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

//Timbrado
export interface Timbrado {
    idTimbrado: number;
    numeroTimbrado: string;
    fechaInicio: string;
    fechaFinal: string;
    ruc: string;
    establecimiento: string;
    puntoExpedicion: string;
    numeroInicial: number;
    numeroFinal: number;
    ultimoNumeroUsado: number;
    tipoComprobante: string;
    activo: boolean;
}

//Ventas/Facturación
export interface FacturaVentaItem {
    idProducto: number;
    producto: string;
    cantidad: number;
    cantidadDevuelta?: number;
    precioUnitario: number;
    totalBruto: number;
    totalIva: number;
    totalNeto: number;
}

export interface FacturaVentaItemSave {
    idProducto: number;
    cantidad: number;
}

export interface FacturaVentaCompleto {
    idFacturaVenta: number;
    idPresupuesto: number;
    presupuestoDescripcion: string;
    idCliente: number;
    cliente: string;
    nroComprobante: string;
    idEstado: number;
    estado: string;
    idTimbrado: number;
    timbrado: string;
    timbradoRuc: string;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    medioPagoCompra: string;
    fechaPago: string;
    items: FacturaVentaItem[];
}

export interface FacturaVentaCompletoSave {
    idPresupuesto: number;
    idCliente: number;
    nroComprobante: string;
    idEstado: number;
    idTimbrado: number;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    fechaPago: string;
    items: FacturaVentaItemSave[];
}

export interface FacturaVentaCabeceraSave {
    idPresupuesto: number;
    idCliente: number;
    nroComprobante: string;
    idEstado: number;
    idTimbrado: number;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    fechaPago: string;
}

export interface FacturaVentaCabecera {
    idFacturaVenta: number;
    idPresupuesto: number;
    presupuestoDescripcion: string;
    idCliente: number;
    cliente: string;
    nroComprobante: string;
    idEstado: number;
    estado: string;
    idTimbrado: number;
    timbrado: string;
    timbradoRuc: string;
    fecha: string;
    descripcion: string;
    idMedioPagoCompra: number;
    medioPagoCompra: string;
    fechaPago: string;
}

//Stock/Depositos
export interface StockDeposito {
    idDeposito: number;
    idProducto: number;
    cantidad: number;
    deposito: string;
    producto: string;
}

export interface StockDepositoSave {
    idDeposito: number;
    idProducto: number;
    cantidad: number;
}

//Ventas/Devoluciones
export interface NotaCreditoVentaItem {
    idNotaCreditoVentaDetalle: number;
    idNotaCreditoVenta: number;
    idProducto: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface NotaCreditoVentaItemSave {
    idProducto: number;
    cantidad: number;
}

export interface NotaCreditoVenta {
    idNotaCreditoVenta: number;
    idFacturaVenta: number;
    facturaVenta: string;
    idEstado: number;
    estado: string;
    idNotaDevolucionVenta: number;
    notaDevolucionVenta: string;
    idTimbrado: number;
    timbrado: string;
    nroComprobante: string;
    motivo: string;
    fechaEmision: string;
    total: number;
    detalles: NotaCreditoVentaItem[];
}

export interface NotaCreditoVentaSave {
    idFacturaVenta: number;
    idEstado?: number;
    idTimbrado?: number;
    motivo: string;
    fechaEmision: string;
    items: NotaCreditoVentaItemSave[];
}

export interface NotaCreditoVentaDetalle {
    idNotaCreditoVentaDetalle: number;
    idNotaCreditoVenta: number;
    idProducto: number;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface NotaConCliente {
    idNotaCreditoVenta: number;
    idFacturaVenta: number;
    facturaVenta: string;
    idEstado: number;
    estado: string;
    idCliente: number;
    cliente: string;
    idNotaDevolucionVenta: number;
    notaDevolucionVenta: string;
    idTimbrado: number;
    timbrado: string;
    nroComprobante: string;
    motivo: string;
    fechaEmision: string;
    total: number;
    detalles: NotaCreditoVentaItem[];
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

export interface MedioPago {
    idMedioPagoCompra: number;
    nombre: string;
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

export interface PedidoDetalleCompletoSaveDTO {
    idProducto: number;
    idCategoria: number;
    descripcion: string;
    cantidad: number;
}

export interface PedidoCompletoSaveDTO extends PedidoSaveDTO {
    detalles: PedidoDetalleCompletoSaveDTO[];
}

export type EstadoProcesoContable =
    | "Habilitado"
    | "Abierto"
    | "Activo"
    | "Activa"
    | "Registrado"
    | "Registrada"
    | string

export interface ProcesoContableDTO {
    idProcesoContable: number
    periodoAnho: number
    descripcion: string
    cantNiveles: number
    cantDigitosNivel: number
    moneda: string
    estado: EstadoProcesoContable

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

export interface ReportePeriodoContableDTO {
    idPeriodoContable?: number
    idProcesoContable?: number
    procesoContable?: string | null
    anho?: number
    mes?: number
    fechaInicio?: string | null
    fechaFin?: string | null
    estado?: string | null
}

export interface ReporteCuentaContableDTO {
    idCuentaContable?: number
    codigo?: string | null
    numeroCuenta?: string | null
    nombre?: string | null
    tipoCuenta?: TipoCuentaContable | string | null
}

export interface ReporteContableBaseDTO {
    periodo?: ReportePeriodoContableDTO | null
    idPeriodoContable?: number
    moneda?: string | null
    generadoEn?: string | null
}

export interface LibroDiarioLineaDTO {
    idAsiento?: number
    numeroAsiento?: number
    fecha?: string | null
    descripcion?: string | null
    item?: number
    idCuentaContable?: number
    codigoCuenta?: string | null
    numeroCuenta?: string | null
    cuenta?: string | null
    cuentaContable?: string | null
    descripcionItem?: string | null
    tipoMovimiento?: TipoMovimientoAsiento | string | null
    debe?: number
    haber?: number
    monto?: number
}

export interface LibroDiarioAsientoDTO {
    idAsiento?: number
    numeroAsiento?: number
    fecha?: string | null
    descripcion?: string | null
    referenciaOrigen?: string | null
    balanceado?: boolean
    totalDebe?: number
    totalHaber?: number
    diferencia?: number
    lineas?: LibroDiarioLineaDTO[]
    detalles?: LibroDiarioLineaDTO[]
}

export interface LibroDiarioReporteDTO extends ReporteContableBaseDTO {
    asientos?: LibroDiarioAsientoDTO[]
    items?: LibroDiarioAsientoDTO[]
    totalDebe?: number
    totalHaber?: number
    diferencia?: number
}

export interface LibroMayorMovimientoDTO {
    fecha?: string | null
    idAsiento?: number
    numeroAsiento?: number
    descripcion?: string | null
    referenciaOrigen?: string | null
    debe?: number
    haber?: number
    saldo?: number
}

export interface LibroMayorCuentaDTO {
    cuenta?: ReporteCuentaContableDTO | null
    idCuentaContable?: number
    codigoCuenta?: string | null
    numeroCuenta?: string | null
    cuentaNombre?: string | null
    nombreCuenta?: string | null
    cuentaContable?: string | null
    saldoAnterior?: number
    totalDebe?: number
    totalHaber?: number
    saldoDeudor?: number
    saldoAcreedor?: number
    saldoFinal?: number
    movimientos?: LibroMayorMovimientoDTO[]
}

export interface LibroMayorReporteDTO extends ReporteContableBaseDTO {
    cuentas?: LibroMayorCuentaDTO[]
    items?: LibroMayorCuentaDTO[]
}

export interface BalanceSumasYSaldosLineaDTO {
    cuenta?: ReporteCuentaContableDTO | null
    idCuentaContable?: number
    codigoCuenta?: string | null
    numeroCuenta?: string | null
    cuentaNombre?: string | null
    nombreCuenta?: string | null
    cuentaContable?: string | null
    saldoAnterior?: number
    debe?: number
    haber?: number
    totalDebe?: number
    totalHaber?: number
    saldoDeudor?: number
    saldoAcreedor?: number
    saldo?: number
}

export interface BalanceSumasYSaldosReporteDTO extends ReporteContableBaseDTO {
    lineas?: BalanceSumasYSaldosLineaDTO[]
    items?: BalanceSumasYSaldosLineaDTO[]
    totalDebe?: number
    totalHaber?: number
    totalSaldoDeudor?: number
    totalSaldoAcreedor?: number
    diferencia?: number
    cuadrado?: boolean
}

export interface BalanceGeneralLineaDTO {
    cuenta?: ReporteCuentaContableDTO | null
    idCuentaContable?: number
    codigoCuenta?: string | null
    numeroCuenta?: string | null
    cuentaNombre?: string | null
    nombreCuenta?: string | null
    cuentaContable?: string | null
    tipoCuenta?: TipoCuentaContable | string | null
    grupo?: string | null
    importe?: number
    saldo?: number
    saldoDeudor?: number
    saldoAcreedor?: number
}

export interface BalanceGeneralReporteDTO extends ReporteContableBaseDTO {
    lineas?: BalanceGeneralLineaDTO[]
    items?: BalanceGeneralLineaDTO[]
    activo?: BalanceGeneralLineaDTO[]
    pasivo?: BalanceGeneralLineaDTO[]
    patrimonio?: BalanceGeneralLineaDTO[]
    totalActivo?: number
    totalPasivo?: number
    totalPatrimonio?: number
    diferencia?: number
    cuadrado?: boolean
}

export interface BalanceResultadosLineaDTO {
    cuenta?: ReporteCuentaContableDTO | null
    idCuentaContable?: number
    codigoCuenta?: string | null
    numeroCuenta?: string | null
    cuentaNombre?: string | null
    nombreCuenta?: string | null
    cuentaContable?: string | null
    tipoCuenta?: TipoCuentaContable | string | null
    grupo?: string | null
    importe?: number
    saldo?: number
    saldoDeudor?: number
    saldoAcreedor?: number
}

export interface BalanceResultadosReporteDTO extends ReporteContableBaseDTO {
    lineas?: BalanceResultadosLineaDTO[]
    items?: BalanceResultadosLineaDTO[]
    ingresos?: BalanceResultadosLineaDTO[]
    costosGastos?: BalanceResultadosLineaDTO[]
    gastos?: BalanceResultadosLineaDTO[]
    totalIngresos?: number
    totalCostosGastos?: number
    totalGastos?: number
    resultadoNeto?: number
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

export interface Cargo {
    idCargo: number
    nombre: string
    descripcion: string | null
    activo: boolean
}

export interface CargoSaveDTO {
    idCargo?: number
    nombre: string
    descripcion: string | null
    activo: boolean
}

export interface ConceptoSalario {
    idConceptoSalario: number
    codigo: string
    descripcion: string
    tipo: string
    deducibleIps: boolean
    esSalarioBase: boolean
    esIps: boolean
    esBonificacionFamiliar: boolean
    activo: boolean
}

export interface ConceptoSalarioSaveDTO {
    idConceptoSalario?: number
    codigo: string
    descripcion: string
    tipo: string
    deducibleIps: boolean
    esSalarioBase: boolean
    esIps: boolean
    esBonificacionFamiliar: boolean
    activo: boolean
}

export interface ParametroSalario {
    idParametroSalario: number
    fechaDesde: string
    fechaHasta: string | null
    salarioMinimo: number
    porcentajeIpsEmpleado: number
    porcentajeBonificacionFamiliar: number
    activo: boolean
}

export interface ParametroSalarioSaveDTO {
    idParametroSalario?: number
    fechaDesde: string
    fechaHasta: string | null
    salarioMinimo: number
    porcentajeIpsEmpleado: number
    porcentajeBonificacionFamiliar: number
    activo: boolean
}

export interface EmpleadoCargo {
    idEmpleadoCargo: number
    idEmpleado: number
    empleado: string
    idCargo: number
    cargo: string
    fechaDesde: string
    fechaHasta: string | null
    activo: boolean
}

export interface EmpleadoCargoSaveDTO {
    idEmpleadoCargo?: number
    idEmpleado: number
    idCargo: number
    fechaDesde: string
    fechaHasta: string | null
    activo: boolean
}

export interface EmpleadoConceptoMensual {
    idEmpleadoConceptoMensual: number
    idEmpleado: number
    empleado: string
    idConceptoSalario: number
    conceptoSalario: string
    monto: number
    fechaDesde: string
    fechaHasta: string | null
    activo: boolean
}

export interface EmpleadoConceptoMensualSaveDTO {
    idEmpleadoConceptoMensual?: number
    idEmpleado: number
    idConceptoSalario: number
    monto: number
    fechaDesde: string
    fechaHasta: string | null
    activo: boolean
}

export interface ProcesoPagoSalario {
    idProcesoPagoSalario: number
    periodoAnho: number
    periodoMes: number
    fechaPago: string
    estado: string
    idAsiento: number | null
    totalIngresos: number
    totalEgresos: number
    totalNeto: number
    createdAt: string
    cerradoAt: string | null
}

export interface ProcesoPagoSalarioSaveDTO {
    periodoAnho: number
    periodoMes: number
    fechaPago: string
}

export interface PagoSalarioDetalle {
    idPagoSalarioDetalle: number
    idProcesoPagoSalario: number
    idEmpleado: number
    empleado: string
    idConceptoSalario: number
    conceptoSalario: string
    tipo: string
    monto: number
    deducibleIps: boolean
    esAutomatico: boolean
    observacion: string | null
}

export interface PagoSalarioDetalleSaveDTO {
    idEmpleado: number
    idConceptoSalario: number
    monto: number
    observacion: string | null
}

export interface CerrarProcesoPagoSalarioDTO {
    idModulo: number
    idCuentaGastoSalarios: number
    idCuentaPago: number
    idCuentaIpsPagar: number | null
    idCuentaOtrosEgresosPagar: number | null
    descripcionAsiento: string | null
}

export interface ReciboPagoSalario {
    copia: string
    idProcesoPagoSalario: number
    idEmpleado: number
    empleado: string
    ci: string
    ruc: string
    periodoAnho: number
    periodoMes: number
    fechaPago: string
    ingresos: PagoSalarioDetalle[]
    egresos: PagoSalarioDetalle[]
    totalIngresos: number
    totalEgresos: number
    netoPagar: number
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

export type CotizacionDetalleCompletoSaveDTO = Omit<CotizacionDetalleSaveDTO, "idPedidoCotizacion">

export interface CotizacionCompletaSaveDTO extends CotizacionSaveDTO {
    detalles: CotizacionDetalleCompletoSaveDTO[]
}

export interface CotizacionItemForm {
    idDetalle?: number;
    productoId: number;
    idCategoria?: number;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
}

export interface CotizacionFormState {
    solicitudCotizacionId: string;
    proveedorId: string;
    fecha: string;
    validaHasta: string;
    idEstado: number;
    numeroPedido: number;
    items: CotizacionItemForm[];
}

export interface OrdenCompraDetalleDTO {
    idOrdenCompraDetalle: number;
    idOrdenCompra: number;
    idProducto: number;
    producto?: ProductoDTO;
    descripcion?: string;
    cantidad: number;
}

export interface OrdenCompraDetalleSaveDTO {
    idOrdenCompraDetalle: number;
    idOrdenCompra: number;
    idProducto: number;
    cantidad: number;
}

export interface OrdenCompraDTO {
    idOrdenCompra: number;
    idPedidoCotizacion: number;
    idProveedor: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
    estado: string;
    proveedor?: string;
    detalles?: OrdenCompraDetalleDTO[];
}

export interface OrdenCompraSaveDTO {
    idPedidoCotizacion: number;
    idProveedor: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
}

export interface FacturaCompraDetalle {
    idFacturaCompraDetalle?: number;
    idFacturaCompra?: number;
    idProducto: number;
    producto?: ProductoDTO;
    descripcion?: string;
    cantidad: number;
    precioUnitario: number;
    totalBruto: number;
    totalIva: number;
    totalNeto: number;
}

export interface FacturaCompra {
    id?: number;
    idFacturaCompra: number;
    idProveedor: number;
    proveedor: string;
    idOrdenCompra?: number;
    idEstado?: number;
    ordenCompraDescripcion?: string;
    nroComprobante: string;
    timbrado: string;
    fecha: string;
    descripcion?: string;
    estado: string;
    nombreEstado?: string;
    detalles?: FacturaCompraDetalle[];
}

export interface FacturaCompraDetalleSaveDTO {
    idFacturaCompra?: number;
    idProducto: number;
    cantidad: number;
    precioUnitario: number;
    totalBruto: number;
    totalIva: number;
    totalNeto: number;
}

export interface FacturaCompraSaveDTO {
    idOrdenCompra: number;
    idProveedor: number;
    nroComprobante: string;
    timbrado: string;
    fecha: string;
    descripcion?: string;
    estado?: string;
    idEstado?: number;
    detalles?: FacturaCompraDetalleSaveDTO[];
}

export interface MedioPagoLinea {
    tipo: string;
    referencia: string;
    monto: number;
}

export interface OrdenPagoCompraDetalle {
    idOrdenPagoCompraDetalle?: number;
    idOrdenPagoCompra: number;
    idFacturaCompra: number;
    monto: number;
    montoPagado?: number;
    subtotal?: number;
    idMedioPagoCompra?: number;
    idCuentaBancaria?: number;
    referencia?: string;
    medioPago?: string;
}

export interface FacturaCompraDetalleBulkDTO extends FacturaCompraDetalleSaveDTO {}

export interface OrdenPagoCompra {
    idOrdenPagoCompra: number;
    id?: number;
    idProveedor: number;
    proveedor?: string;
    idEstado?: number;
    estado: string;
    fecha: string;
    descripcion?: string;
    detalles?: OrdenPagoCompraDetalle[];
    detallesFacturas?: OrdenPagoCompraDetalle[];
}

export interface OrdenPagoCompraSaveDTO {
    idProveedor: number;
    idEstado: number;
    fecha: string;
    descripcion: string;
    detalles?: OrdenPagoCompraDetalleSaveDTO[];
}

export interface OrdenPagoCompraDetalleSaveDTO {
    idOrdenPagoCompra?: number;
    idFacturaCompra: number;
    monto: number;
    idMedioPagoCompra?: number;
    idCuentaBancaria?: number;
}

export interface NotaCreditoItemForm {
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

export interface NotaCreditoCompraDetalleDTO {
    idNotaCreditoCompraDetalle?: number;
    idNotaCreditoCompra?: number;
    idProducto: number;
    producto?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface NotaCreditoCompraDTO {
    idNotaCreditoCompra: number;
    idFacturaCompra: number;
    nroComprobanteFactura?: string;
    idNotaDevolucionCompra?: number;
    timbrado: string;
    motivo: string;
    fechaEmision: string;
    total?: number;
    idProveedor?: number;
    proveedor?: string;
    detalles?: NotaCreditoCompraDetalleDTO[];
}

export interface NotaCreditoCompraSaveDTO {
    idFacturaCompra: number;
    idNotaDevolucionCompra?: number;
    timbrado: string;
    motivo: string;
    fechaEmision: string;
    total?: number;
    items: NotaCreditoItemForm[];
}

export interface ProductoNotaDevolucionDetalleDTO {
    idProducto: number;
    descripcion: string;
}

export interface NotasDevolucionesComprasDetalleDTO {
    idNotaDevolucionCompraDetalle: number;
    idNotaDevolucionCompra: number;
    idProducto: number;
    cantidad?: number;
    precioUnitario: number;
    subtotal: number;
    producto?: ProductoNotaDevolucionDetalleDTO | null;
}

export interface NotaDevolucionCompraDTO {
    idNotaDevolucionCompra: number;
    idFacturaCompra: number;
    idProveedor: number;
    proveedor?: string;
    fecha: string;
    motivo: string;
    estado: string;
    detalles?: NotasDevolucionesComprasDetalleDTO[];
}

export interface NotaDevolucionCompraSaveDTO {
    idFacturaCompra: number;
    idEstado: number;
    fecha: string;
    motivo: string;
    detalles: {
        idProducto: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }[];
}

// Banco y Tesorería
export interface Banco {
    idBanco: number;
    nombre: string;
    activo: boolean;
}

export interface BancoSaveDTO {
    nombre: string;
    activo: boolean;
}

export interface TipoCuentaBancaria {
    idTipoCuentaBancaria: number;
    nombre: string;
}

export interface CuentaBancaria {
    idCuentaBancaria: number;
    idBanco: number;
    banco: string;
    idTipoCuentaBancaria: number;
    tipoCuentaBancaria: string;
    idCuentaContable: number;
    cuentaContable: string;
    numeroCuenta: string;
    moneda: string;
    saldo: number;
    saldoDisponible: number;
    activa: boolean;
}

export interface CuentaBancariaSaveDTO {
    idBanco: number;
    idTipoCuentaBancaria: number;
    idCuentaContable: number;
    numeroCuenta: string;
    moneda: string;
    activa: boolean;
}

export interface CuentaContable {
    idCuentaContable: number;
    idProcesoContable: number;
    procesoContable: string;
    idCuentaPadre: number | null;
    cuentaPadre: string;
    numeroCuenta: string;
    nombre: string;
    tipoCuenta: string;
    esAsentable: boolean;
    activa: boolean;
}

export interface TipoMovimientoBancario {
    idTipoMovimientoBancario: number;
    nombre: string;
}

export interface MovimientoBancario {
    idMovimientoBancario: number;
    idCuentaBancaria: number;
    cuentaBancaria: string;
    idTipoMovimientoBancario: number;
    tipoMovimientoBancario: string;
    idEstado: number | null;
    estado: string;
    idOrdenMedioPagoCompra: number | null;
    idChequeEmitido: number | null;
    fecha: string;
    monto: number;
    concepto: string;
    referencia: string;
}

export interface MovimientoBancarioSaveDTO {
    idCuentaBancaria: number;
    idTipoMovimientoBancario: number;
    idEstado: number | null;
    idOrdenMedioPagoCompra?: number | null;
    idChequeEmitido?: number | null;
    fecha: string;
    monto: number;
    concepto: string;
    referencia: string;
}

export interface ChequeEmitido {
    idChequeEmitido: number;
    idCuentaBancaria: number;
    cuentaBancaria: string;
    idOrdenMedioPagoCompra: number | null;
    idMovimientoBancario: number | null;
    numeroCheque: string;
    beneficiario: string;
    fechaEmision: string;
    fechaPago?: string | null;
    monto: number;
    estado: string;
}

export interface ChequeEmitidoSaveDTO {
    idCuentaBancaria: number;
    idOrdenMedioPagoCompra?: number | null;
    idMovimientoBancario?: number | null;
    numeroCheque: string;
    beneficiario: string;
    fechaEmision: string;
    monto: number;
    estado?: string;
}

export interface ChequeTercero {
    idChequeTercero: number;
    idDepositoBancario: number;
    bancoEmisor: string;
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
    estado: string;
}

export interface ChequeTerceroLineSave {
    bancoEmisor: string;
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
}

export interface ChequeTerceroSaveDTO {
    idDepositoBancario: number;
    bancoEmisor: string;
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
    estado: string;
}

export interface ChequeMismoBanco {
    idChequeMismoBanco: number;
    idDepositoBancario: number;
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
}

export interface ChequeMismoBancoLineSave {
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
}

export interface ChequeMismoBancoSaveDTO {
    idDepositoBancario: number;
    numeroCheque: string;
    librador: string;
    fechaEmision: string;
    monto: number;
}

export interface TipoDepositoBancario {
    idTipoDepositoBancario: number;
    nombre: string;
}

export interface DepositoBancario {
    idDepositoBancario: number;
    idCuentaBancaria: number;
    cuentaBancaria: string;
    idTipoDepositoBancario: number;
    tipoDepositoBancario: string;
    idMovimientoBancario: number;
    fecha: string;
    monto: number;
    concepto: string;
    estado: string;
}

export interface DepositoBancarioSaveDTO {
    idCuentaBancaria: number;
    idTipoDepositoBancario: number;
    fecha: string;
    monto: number;
    concepto: string;
}

export interface DetalleDepositoBancario {
    idDetalleDepositoBancario: number;
    idDepositoBancario: number;
    monto: number;
    descripcion: string;
}

export interface DetalleDepositoBancarioSaveDTO {
    idDepositoBancario: number;
    monto: number;
    descripcion: string;
}
