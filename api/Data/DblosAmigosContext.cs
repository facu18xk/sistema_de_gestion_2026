using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace api.Models;

public partial class DblosAmigosContext : DbContext
{
    public DblosAmigosContext()
    {
    }

    public DblosAmigosContext(DbContextOptions<DblosAmigosContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Categoria> Categorias { get; set; }

    public virtual DbSet<Ciudad> Ciudades { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Deposito> Depositos { get; set; }

    public virtual DbSet<Direccion> Direcciones { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<Estado> Estados { get; set; }

    public virtual DbSet<FacturasCompra> FacturasCompras { get; set; }

    public virtual DbSet<FacturasComprasDetalle> FacturasComprasDetalles { get; set; }

    public virtual DbSet<FacturasVenta> FacturasVentas { get; set; }

    public virtual DbSet<FacturasVentasDetalle> FacturasVentasDetalles { get; set; }

    public virtual DbSet<Marca> Marcas { get; set; }

    public virtual DbSet<MediosPagosCompra> MediosPagosCompras { get; set; }

    public virtual DbSet<NotasCreditosCompra> NotasCreditosCompras { get; set; }

    public virtual DbSet<NotasCreditosComprasDetalle> NotasCreditosComprasDetalles { get; set; }

    public virtual DbSet<NotasCreditosVenta> NotasCreditosVentas { get; set; }

    public virtual DbSet<NotasCreditosVentasDetalle> NotasCreditosVentasDetalles { get; set; }

    public virtual DbSet<NotasDevolucionesCompra> NotasDevolucionesCompras { get; set; }

    public virtual DbSet<NotasDevolucionesComprasDetalle> NotasDevolucionesComprasDetalles { get; set; }

    public virtual DbSet<NotasDevolucionesVenta> NotasDevolucionesVentas { get; set; }

    public virtual DbSet<NotasDevolucionesVentasDetalle> NotasDevolucionesVentasDetalles { get; set; }

    public virtual DbSet<OrdenesCompra> OrdenesCompras { get; set; }

    public virtual DbSet<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; }

    public virtual DbSet<OrdenesMediosPagosCompra> OrdenesMediosPagosCompras { get; set; }

    public virtual DbSet<OrdenesPagosCompra> OrdenesPagosCompras { get; set; }

    public virtual DbSet<OrdenesPagosComprasDetalle> OrdenesPagosComprasDetalles { get; set; }

    public virtual DbSet<OrdenesVenta> OrdenesVentas { get; set; }

    public virtual DbSet<OrdenesVentasDetalle> OrdenesVentasDetalles { get; set; }

    public virtual DbSet<Pais> Paises { get; set; }

    public virtual DbSet<Pariente> Parientes { get; set; }

    public virtual DbSet<PedidosCompra> PedidosCompras { get; set; }

    public virtual DbSet<PedidosComprasDetalle> PedidosComprasDetalles { get; set; }

    public virtual DbSet<PedidosCotizaciones> PedidosCotizaciones { get; set; }

    public virtual DbSet<PedidosCotizacionesDetalle> PedidosCotizacionesDetalles { get; set; }

    public virtual DbSet<ProductoProveedor> ProductosProveedores { get; set; }

    public virtual DbSet<Persona> Personas { get; set; }

    public virtual DbSet<CotizacionesCompra> CotizacionesCompras { get; set; }

    public virtual DbSet<CotizacionesComprasDetalle> CotizacionesComprasDetalles { get; set; }

    public virtual DbSet<Presupuesto> Presupuestos { get; set; }

    public virtual DbSet<PresupuestosDetalle> PresupuestosDetalles { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Proveedor> Proveedores { get; set; }

    public virtual DbSet<StocksDeposito> StocksDepositos { get; set; }

    public virtual DbSet<Timbrado> Timbrados { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.IdCategoria);

            entity.Property(e => e.IdCategoria).HasColumnName("Id_Categoria");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.HasKey(e => e.IdCiudad);

            entity.Property(e => e.IdCiudad).HasColumnName("Id_Ciudad");
            entity.Property(e => e.IdPais).HasColumnName("Id_Pais");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.IdPaisNavigation).WithMany(p => p.Ciudades)
                .HasForeignKey(d => d.IdPais)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ciudades_Paises1");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.IdCliente);

            entity.Property(e => e.IdCliente).HasColumnName("Id_Cliente");
            entity.Property(e => e.Ci)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("CI");
            entity.Property(e => e.FechaNacimiento).HasColumnName("Fecha_Nacimiento");
            entity.Property(e => e.IdPersona).HasColumnName("Id_Persona");
            entity.Property(e => e.Ruc)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("RUC");

            entity.HasOne(d => d.IdPersonaNavigation).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.IdPersona)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Clientes_Personas");
        });

        modelBuilder.Entity<Deposito>(entity =>
        {
            entity.HasKey(e => e.IdDeposito);

            entity.Property(e => e.IdDeposito).HasColumnName("Id_Deposito");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Direccion>(entity =>
        {
            entity.HasKey(e => e.IdDireccion);

            entity.Property(e => e.IdDireccion).HasColumnName("Id_Direccion");
            entity.Property(e => e.Calle1)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Calle_1");
            entity.Property(e => e.Calle2)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Calle_2");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IdCiudad).HasColumnName("Id_Ciudad");

            entity.HasOne(d => d.IdCiudadNavigation).WithMany(p => p.Direcciones)
                .HasForeignKey(d => d.IdCiudad)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Direcciones_Ciudades1");
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.IdEmpleado);

            entity.Property(e => e.IdEmpleado).HasColumnName("Id_Empleado");
            entity.Property(e => e.Ci)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("CI");
            entity.Property(e => e.FechaIngreso).HasColumnName("Fecha_Ingreso");
            entity.Property(e => e.IdPersona).HasColumnName("Id_Persona");
            entity.Property(e => e.Ruc)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("RUC");

            entity.HasOne(d => d.IdPersonaNavigation).WithMany(p => p.Empleados)
                .HasForeignKey(d => d.IdPersona)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Empleados_Personas");
        });

        modelBuilder.Entity<Estado>(entity =>
        {
            entity.HasKey(e => e.IdEstado);

            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<FacturasCompra>(entity =>
        {
            entity.HasKey(e => e.IdFacturaCompra);

            entity.ToTable("Facturas_Compras");

            entity.Property(e => e.IdFacturaCompra).HasColumnName("Id_Factura_Compra");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdOrdenCompra).HasColumnName("Id_Orden_Compra");
            entity.Property(e => e.IdProveedor).HasColumnName("Id_Proveedor");
            entity.Property(e => e.NroComprobante)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Nro_Comprobante");
            entity.Property(e => e.Timbrado)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.IdOrdenCompraNavigation).WithMany(p => p.FacturasCompras)
                .HasForeignKey(d => d.IdOrdenCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Compras_Ordenes_Compras");

            entity.HasOne(d => d.IdProveedorNavigation).WithMany(p => p.FacturasCompras)
                .HasForeignKey(d => d.IdProveedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Compras_Proveedores");
        });

        modelBuilder.Entity<FacturasComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdFacturaCompraDetalle);

            entity.ToTable("Facturas_Compras_Detalles");

            entity.Property(e => e.IdFacturaCompraDetalle).HasColumnName("Id_Factura_Compra_Detalle");
            entity.Property(e => e.IdFacturaCompra).HasColumnName("Id_Factura_Compra");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.TotalBruto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Bruto");
            entity.Property(e => e.TotalIva)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_IVA");
            entity.Property(e => e.TotalNeto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Neto");

            entity.HasOne(d => d.IdFacturaCompraNavigation).WithMany(p => p.FacturasComprasDetalles)
                .HasForeignKey(d => d.IdFacturaCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Compras_Detalles_Facturas_Compras");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.FacturasComprasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<FacturasVenta>(entity =>
        {
            entity.HasKey(e => e.IdFacturaVenta);

            entity.ToTable("Facturas_Ventas");

            entity.Property(e => e.IdFacturaVenta).HasColumnName("Id_Factura_venta");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.FechaPago)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("Fecha_Pago");
            entity.Property(e => e.IdCliente).HasColumnName("Id_Cliente");
            entity.Property(e => e.IdMedioPagoCompra).HasColumnName("Id_Medio_Pago_Compra");
            entity.Property(e => e.IdOrdenVenta).HasColumnName("Id_Orden_Venta");
            entity.Property(e => e.IdTimbrado).HasColumnName("Id_Timbrado");
            entity.Property(e => e.NroComprobante)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Nro_Comprobante");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.FacturasVenta)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Clientes");

            entity.HasOne(d => d.IdMedioPagoCompraNavigation).WithMany(p => p.FacturasVenta)
                .HasForeignKey(d => d.IdMedioPagoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Medios_Pagos_Compras");

            entity.HasOne(d => d.IdOrdenVentaNavigation).WithMany(p => p.FacturasVenta)
                .HasForeignKey(d => d.IdOrdenVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Ordenes_Ventas");

            entity.HasOne(d => d.IdTimbradoNavigation).WithMany(p => p.FacturasVenta)
                .HasForeignKey(d => d.IdTimbrado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Timbrados");
        });

        modelBuilder.Entity<FacturasVentasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdFacturaVentaDetalle);

            entity.ToTable("Facturas_Ventas_Detalles");

            entity.Property(e => e.IdFacturaVentaDetalle).HasColumnName("Id_Factura_Venta_Detalle");
            entity.Property(e => e.IdFacturaVenta).HasColumnName("Id_Factura_Venta");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.TotalBruto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Bruto");
            entity.Property(e => e.TotalIva)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_IVA");
            entity.Property(e => e.TotalNeto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Neto");

            entity.HasOne(d => d.IdFacturaVentaNavigation).WithMany(p => p.FacturasVentasDetalles)
                .HasForeignKey(d => d.IdFacturaVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Detalles_Facturas_Ventas");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.FacturasVentasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Facturas_Ventas_Detalles_Productos");
        });

        modelBuilder.Entity<Marca>(entity =>
        {
            entity.HasKey(e => e.IdMarca);

            entity.Property(e => e.IdMarca).HasColumnName("Id_Marca");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<MediosPagosCompra>(entity =>
        {
            entity.HasKey(e => e.IdMedioPagoCompra);

            entity.ToTable("Medios_Pagos_Compras");

            entity.Property(e => e.IdMedioPagoCompra).HasColumnName("Id_Medio_Pago_Compra");
            entity.Property(e => e.Nombre)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<NotasCreditosCompra>(entity =>
        {
            entity.HasKey(e => e.IdNotaCreditoCompra);

            entity.ToTable("Notas_Creditos_Compras");

            entity.Property(e => e.IdNotaCreditoCompra).HasColumnName("Id_Nota_Credito_Compra");
            entity.Property(e => e.FechaEmision).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdFacturaCompra).HasColumnName("Id_Factura_Compra");
            entity.Property(e => e.IdNotaDevolucionCompra).HasColumnName("Id_Nota_Devolucion_Compra");
            entity.Property(e => e.Motivo)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Timbrado)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Total).HasColumnType("decimal(10, 0)");

            entity.HasOne(d => d.IdFacturaCompraNavigation).WithMany(p => p.NotasCreditosCompras)
                .HasForeignKey(d => d.IdFacturaCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Compras_Facturas_Compras");

            entity.HasOne(d => d.IdNotaDevolucionCompraNavigation).WithMany(p => p.NotasCreditosCompras)
                .HasForeignKey(d => d.IdNotaDevolucionCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Compras_Notas_Devoluciones_Compras");
        });

        modelBuilder.Entity<NotasCreditosComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdNotaCreditoCompraDetalle);

            entity.ToTable("Notas_Creditos_Compras_Detalles");

            entity.Property(e => e.IdNotaCreditoCompraDetalle).HasColumnName("Id_Nota_Credito_Compra_Detalle");
            entity.Property(e => e.IdNotaCreditoCompra).HasColumnName("Id_Nota_Credito_Compra");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdNotaCreditoCompraNavigation).WithMany(p => p.NotasCreditosComprasDetalles)
                .HasForeignKey(d => d.IdNotaCreditoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Compras_Detalles_Notas_Creditos_Compras");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.NotasCreditosComprasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<NotasCreditosVenta>(entity =>
        {
            entity.HasKey(e => e.IdNotaCreditoVenta);

            entity.ToTable("Notas_Creditos_Ventas");

            entity.Property(e => e.IdNotaCreditoVenta).HasColumnName("Id_Nota_Credito_Venta");
            entity.Property(e => e.FechaEmision)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("Fecha_Emision");
            entity.Property(e => e.IdFacturaVenta).HasColumnName("Id_Factura_Venta");
            entity.Property(e => e.IdNotaDevolucionVenta).HasColumnName("Id_Nota_Devolucion_Venta");
            entity.Property(e => e.IdTimbrado).HasColumnName("Id_Timbrado");
            entity.Property(e => e.Motivo)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Total).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdFacturaVentaNavigation).WithMany(p => p.NotasCreditosVenta)
                .HasForeignKey(d => d.IdFacturaVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Ventas_Facturas_Ventas");

            entity.HasOne(d => d.IdNotaDevolucionVentaNavigation).WithMany(p => p.NotasCreditosVenta)
                .HasForeignKey(d => d.IdNotaDevolucionVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Ventas_Notas_Devoluciones_Ventas");

            entity.HasOne(d => d.IdTimbradoNavigation).WithMany(p => p.NotasCreditosVenta)
                .HasForeignKey(d => d.IdTimbrado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Ventas_Timbrados");
        });

        modelBuilder.Entity<NotasCreditosVentasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdNotaCreditoVentaDetalle);

            entity.ToTable("Notas_Creditos_Ventas_Detalles");

            entity.Property(e => e.IdNotaCreditoVentaDetalle).HasColumnName("Id_Nota_Credito_Venta_Detalle");
            entity.Property(e => e.IdNotaCreditoVenta).HasColumnName("Id_Nota_Credito_Venta");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdNotaCreditoVentaNavigation).WithMany(p => p.NotasCreditosVentasDetalles)
                .HasForeignKey(d => d.IdNotaCreditoVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Ventas_Detalles_Notas_Creditos_Ventas");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.NotasCreditosVentasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Creditos_Ventas_Detalles_Productos");
        });

        modelBuilder.Entity<NotasDevolucionesCompra>(entity =>
        {
            entity.HasKey(e => e.IdNotaDevolucionCompra).HasName("PK_Notas_Devoluciones_Compra");

            entity.ToTable("Notas_Devoluciones_Compras");

            entity.Property(e => e.IdNotaDevolucionCompra).HasColumnName("Id_Nota_Devolucion_Compra");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdFacturaCompra).HasColumnName("Id_Factura_Compra");
            entity.Property(e => e.Motivo)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.IdFacturaCompraNavigation).WithMany(p => p.NotasDevolucionesCompras)
                .HasForeignKey(d => d.IdFacturaCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Compras_Facturas_Compras");
        });

        modelBuilder.Entity<NotasDevolucionesComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdNotaDevolucionCompraDetalle);

            entity.ToTable("Notas_Devoluciones_Compras_Detalles");

            entity.Property(e => e.IdNotaDevolucionCompraDetalle).HasColumnName("Id_Nota_Devolucion_Compra_Detalle");
            entity.Property(e => e.IdNotaDevolucionCompra).HasColumnName("Id_Nota_Devolucion_Compra");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdNotaDevolucionCompraNavigation).WithMany(p => p.NotasDevolucionesComprasDetalles)
                .HasForeignKey(d => d.IdNotaDevolucionCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Compras_Detalles_Notas_Devoluciones_Compras");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.NotasDevolucionesComprasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<NotasDevolucionesVenta>(entity =>
        {
            entity.HasKey(e => e.IdNotaDevolucionVenta).HasName("PK_Notas_Devoluciones_Venta");

            entity.ToTable("Notas_Devoluciones_Ventas");

            entity.Property(e => e.IdNotaDevolucionVenta).HasColumnName("Id_Nota_Devolucion_Venta");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdFacturaVenta).HasColumnName("Id_Factura_Venta");
            entity.Property(e => e.Motivo)
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.HasOne(d => d.IdFacturaVentaNavigation).WithMany(p => p.NotasDevolucionesVenta)
                .HasForeignKey(d => d.IdFacturaVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Ventas_Facturas_Ventas");
        });

        modelBuilder.Entity<NotasDevolucionesVentasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdNotaDevolucionVentaDetalle);

            entity.ToTable("Notas_Devoluciones_Ventas_Detalles");

            entity.Property(e => e.IdNotaDevolucionVentaDetalle).HasColumnName("Id_Nota_Devolucion_Venta_Detalle");
            entity.Property(e => e.IdNotaDevolucionVenta).HasColumnName("Id_Nota_Devolucion_venta");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdNotaDevolucionVentaNavigation).WithMany(p => p.NotasDevolucionesVentasDetalles)
                .HasForeignKey(d => d.IdNotaDevolucionVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Ventas_Detalles_Notas_Devoluciones_Ventas");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.NotasDevolucionesVentasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notas_Devoluciones_Ventas_Detalles_Productos");
        });

        modelBuilder.Entity<OrdenesCompra>(entity =>
        {
            entity.HasKey(e => e.IdOrdenCompra);

            entity.ToTable("Ordenes_Compras");

            entity.Property(e => e.IdOrdenCompra).HasColumnName("Id_Orden_Compra");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdCotizacionCompra).HasColumnName("Id_Cotizacion_Compra");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.IdPedidoCotizacion).HasColumnName("Id_Pedido_Cotizacion");
            entity.Property(e => e.IdProveedor).HasColumnName("Id_Proveedor");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.OrdenesCompras)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Compras_Estados");

            entity.HasOne(d => d.IdPedidoCotizacionNavigation).WithMany(p => p.OrdenesCompras)
                .HasForeignKey(d => d.IdPedidoCotizacion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Compras_Pedidos_Cotizaciones");

            entity.HasOne(d => d.IdCotizacionCompraNavigation).WithMany(p => p.OrdenesCompras)
                .HasForeignKey(d => d.IdCotizacionCompra)
                .HasConstraintName("FK_Ordenes_Compras_Cotizaciones_Compras");

            entity.HasOne(d => d.IdProveedorNavigation).WithMany(p => p.OrdenesCompras)
                .HasForeignKey(d => d.IdProveedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Compras_Proveedores");
        });

        modelBuilder.Entity<OrdenesComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdOrdenCompraDetalle);

            entity.ToTable("Ordenes_Compras_Detalles");

            entity.Property(e => e.IdOrdenCompraDetalle).HasColumnName("Id_Orden_Compra_Detalle");
            entity.Property(e => e.IdOrdenCompra).HasColumnName("Id_Orden_Compra");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");

            entity.HasOne(d => d.IdOrdenCompraNavigation).WithMany(p => p.OrdenesComprasDetalles)
                .HasForeignKey(d => d.IdOrdenCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Compras_Detalles_Ordenes_Compras");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.OrdenesComprasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<OrdenesMediosPagosCompra>(entity =>
        {
            entity.HasKey(e => e.IdOrdenMedioPagoCompra);

            entity.ToTable("Ordenes_Medios_Pagos_Compras");

            entity.Property(e => e.IdOrdenMedioPagoCompra).HasColumnName("Id_Orden_Medio_Pago_Compra");
            entity.Property(e => e.IdMedioPagoCompra).HasColumnName("Id_Medio_Pago_Compra");
            entity.Property(e => e.IdOrdenPagoCompra).HasColumnName("Id_Orden_Pago_Compra");
            entity.Property(e => e.Monto).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdMedioPagoCompraNavigation).WithMany(p => p.OrdenesMediosPagosCompras)
                .HasForeignKey(d => d.IdMedioPagoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Medios_Pagos_Compras_Medios_Pagos_Compras");

            entity.HasOne(d => d.IdOrdenPagoCompraNavigation).WithMany(p => p.OrdenesMediosPagosCompras)
                .HasForeignKey(d => d.IdOrdenPagoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Medios_Pagos_Compras_Ordenes_Pagos_Compras");
        });

        modelBuilder.Entity<OrdenesPagosCompra>(entity =>
        {
            entity.HasKey(e => e.IdOrdenPagoCompra);

            entity.ToTable("Ordenes_Pagos_Compras");

            entity.Property(e => e.IdOrdenPagoCompra).HasColumnName("Id_Orden_Pago_Compra");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.IdProveedor).HasColumnName("Id_Proveedor");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.OrdenesPagosCompras)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Pagos_Compras_Estados");

            entity.HasOne(d => d.IdProveedorNavigation).WithMany(p => p.OrdenesPagosCompras)
                .HasForeignKey(d => d.IdProveedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Pagos_Compras_Proveedores");
        });

        modelBuilder.Entity<OrdenesPagosComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdOrdenPagoCompraDetalle);

            entity.ToTable("Ordenes_Pagos_Compras_Detalles");

            entity.Property(e => e.IdOrdenPagoCompraDetalle).HasColumnName("Id_Orden_Pago_Compra_Detalle");
            entity.Property(e => e.IdFacturaCompra).HasColumnName("Id_Factura_Compra");
            entity.Property(e => e.IdOrdenPagoCompra).HasColumnName("Id_Orden_Pago_Compra");
            entity.Property(e => e.Monto).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdFacturaCompraNavigation).WithMany(p => p.OrdenesPagosComprasDetalles)
                .HasForeignKey(d => d.IdFacturaCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Pagos_Compras_Detalles_Facturas_Compras");

            entity.HasOne(d => d.IdOrdenPagoCompraNavigation).WithMany(p => p.OrdenesPagosComprasDetalles)
                .HasForeignKey(d => d.IdOrdenPagoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Pagos_Compras_Detalles_Ordenes_Pagos_Compras");
        });

        modelBuilder.Entity<OrdenesVenta>(entity =>
        {
            entity.HasKey(e => e.IdOrdenVenta);

            entity.ToTable("Ordenes_Ventas");

            entity.Property(e => e.IdOrdenVenta).HasColumnName("Id_Orden_Venta");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdCliente).HasColumnName("Id_Cliente");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.IdPresupuesto).HasColumnName("Id_Presupuesto");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.OrdenesVenta)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Ventas_Clientes");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.OrdenesVenta)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Ventas_Estados");

            entity.HasOne(d => d.IdPresupuestoNavigation).WithMany(p => p.OrdenesVenta)
                .HasForeignKey(d => d.IdPresupuesto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Ventas_Presupuestos");
        });

        modelBuilder.Entity<OrdenesVentasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdOrdenVentaDetalle);

            entity.ToTable("Ordenes_Ventas_Detalles");

            entity.Property(e => e.IdOrdenVentaDetalle).HasColumnName("Id_Orden_venta_Detalle");
            entity.Property(e => e.IdOrdenVenta).HasColumnName("Id_Orden_Venta");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");

            entity.HasOne(d => d.IdOrdenVentaNavigation).WithMany(p => p.OrdenesVentasDetalles)
                .HasForeignKey(d => d.IdOrdenVenta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Ventas_Detalles_Ordenes_Ventas");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.OrdenesVentasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ordenes_Ventas_Detalles_Productos");
        });

        modelBuilder.Entity<Pais>(entity =>
        {
            entity.HasKey(e => e.IdPais);

            entity.Property(e => e.IdPais).HasColumnName("Id_Pais");
            entity.Property(e => e.Nombre)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Pariente>(entity =>
        {
            entity.HasKey(e => e.IdPariente);

            entity.Property(e => e.IdPariente).HasColumnName("Id_Pariente");
            entity.Property(e => e.FechaNacimiento).HasColumnName("Fecha_Nacimiento");
            entity.Property(e => e.IdEmpleado).HasColumnName("Id_Empleado");
            entity.Property(e => e.TipoRelacion)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Tipo_Relacion");

            entity.HasOne(d => d.IdEmpleadoNavigation).WithMany(p => p.Parientes)
                .HasForeignKey(d => d.IdEmpleado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Parientes_Empleados");
        });

        modelBuilder.Entity<PedidosCompra>(entity =>
        {
            entity.HasKey(e => e.IdPedidoCompra).HasName("PK_Pedidos_Compra");

            entity.ToTable("Pedidos_Compras");

            entity.Property(e => e.IdPedidoCompra).HasColumnName("Id_Pedido_Compra");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.NumeroPedido).HasColumnName("Numero_Pedido");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.PedidosCompras)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Compras_Estados");
        });

        modelBuilder.Entity<PedidosComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdPedidoCompraDetalle);

            entity.ToTable("Pedidos_Compras_Detalles");

            entity.Property(e => e.IdPedidoCompraDetalle).HasColumnName("Id_Pedido_Compra_Detalle");
            entity.Property(e => e.Categoria)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IdPedidoCompra).HasColumnName("Id_Pedido_Compra");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");

            entity.HasOne(d => d.IdPedidoCompraNavigation).WithMany(p => p.PedidosComprasDetalles)
                .HasForeignKey(d => d.IdPedidoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Compras_Detalles_Pedidos_Compras");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.PedidosComprasDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<PedidosCotizaciones>(entity =>
        {
            entity.HasKey(e => e.IdPedidoCotizacion);

            entity.ToTable("Pedidos_Cotizaciones");

            entity.Property(e => e.IdPedidoCotizacion).HasColumnName("Id_Pedido_Cotizacion");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.IdPedidoCompra).HasColumnName("Id_Pedido_Compra");
            entity.Property(e => e.NumeroPedido).HasColumnName("Numero_Pedido");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.PedidosCotizaciones)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Cotizaciones_Estados");

            entity.HasOne(d => d.IdPedidoCompraNavigation).WithMany(p => p.PedidosCotizaciones)
                .HasForeignKey(d => d.IdPedidoCompra)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Cotizaciones_Pedidos_Compras");
        });

        modelBuilder.Entity<PedidosCotizacionesDetalle>(entity =>
        {
            entity.HasKey(e => e.IdPedidoCotizacionDetalle);

            entity.ToTable("Pedidos_Cotizaciones_Detalles");

            entity.Property(e => e.IdPedidoCotizacionDetalle).HasColumnName("Id_Pedido_Cotizacion_Detalle");
            entity.Property(e => e.Categoria)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IdPedidoCotizacion).HasColumnName("Id_Pedido_Cotizacion");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.PrecioProducto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Producto");

            entity.HasOne(d => d.IdPedidoCotizacionNavigation).WithMany(p => p.PedidosCotizacionesDetalles)
                .HasForeignKey(d => d.IdPedidoCotizacion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Cotizaciones_Detalles_Pedidos_Cotizaciones");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.PedidosCotizacionesDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedidos_Cotizaciones_Detalles_Productos");
        });

        modelBuilder.Entity<ProductoProveedor>(entity =>
        {
            entity.HasKey(e => new { e.ProductoId, e.ProveedorId });

            entity.ToTable("Productos_Proveedores");

            entity.Property(e => e.ProductoId).HasColumnName("Id_Producto");
            entity.Property(e => e.ProveedorId).HasColumnName("Id_Proveedor");
            entity.Property(e => e.CodigoProveedor)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Codigo_Proveedor");

            entity.HasOne(d => d.Producto).WithMany(p => p.ProductosProveedores)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Productos_Proveedores_Productos");

            entity.HasOne(d => d.Proveedor).WithMany(p => p.ProductosProveedores)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Productos_Proveedores_Proveedores");
        });

        modelBuilder.Entity<Persona>(entity =>
        {
            entity.HasKey(e => e.IdPersona);

            entity.Property(e => e.IdPersona).HasColumnName("Id_Persona");
            entity.Property(e => e.Apellidos)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Correo)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.IdDireccion).HasColumnName("Id_Direccion");
            entity.Property(e => e.Nombres)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Telefono)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.IdDireccionNavigation).WithMany(p => p.Personas)
                .HasForeignKey(d => d.IdDireccion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Personas_Direcciones1");
        });

        modelBuilder.Entity<CotizacionesCompra>(entity =>
        {
            entity.HasKey(e => e.IdCotizacionCompra);

            entity.ToTable("Cotizaciones_Compras");

            entity.Property(e => e.IdCotizacionCompra).HasColumnName("Id_Cotizacion_Compra");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.ProveedorId).HasColumnName("Id_Proveedor");
            entity.Property(e => e.SolicitudCotizacionId).HasColumnName("Id_Solicitud_Cotizacion");
            entity.Property(e => e.ValidaHasta)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("Valida_Hasta");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.CotizacionesCompras)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cotizaciones_Compras_Estados");

            entity.HasOne(d => d.Proveedor).WithMany(p => p.CotizacionesCompras)
                .HasForeignKey(d => d.ProveedorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cotizaciones_Compras_Proveedores");

            entity.HasOne(d => d.SolicitudCotizacion).WithMany(p => p.CotizacionesCompras)
                .HasForeignKey(d => d.SolicitudCotizacionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cotizaciones_Compras_Pedidos_Cotizaciones");
        });

        modelBuilder.Entity<CotizacionesComprasDetalle>(entity =>
        {
            entity.HasKey(e => e.IdCotizacionCompraDetalle);

            entity.ToTable("Cotizaciones_Compras_Detalles");

            entity.Property(e => e.IdCotizacionCompraDetalle).HasColumnName("Id_Cotizacion_Compra_Detalle");
            entity.Property(e => e.CotizacionCompraId).HasColumnName("Id_Cotizacion_Compra");
            entity.Property(e => e.Descuento).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");
            entity.Property(e => e.ProductoId).HasColumnName("Id_Producto");

            entity.HasOne(d => d.CotizacionCompra).WithMany(p => p.CotizacionesComprasDetalles)
                .HasForeignKey(d => d.CotizacionCompraId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cotizaciones_Compras_Detalles_Cotizaciones_Compras");

            entity.HasOne(d => d.Producto).WithMany(p => p.CotizacionesComprasDetalles)
                .HasForeignKey(d => d.ProductoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cotizaciones_Compras_Detalles_Productos");
        });

        modelBuilder.Entity<Presupuesto>(entity =>
        {
            entity.HasKey(e => e.IdPresupuesto);

            entity.Property(e => e.IdPresupuesto).HasColumnName("Id_Presupuesto");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.FechaVencimiento)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("Fecha_Vencimiento");
            entity.Property(e => e.IdCliente).HasColumnName("Id_Cliente");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.Presupuestos)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Presupuestos_Clientes");

            entity.HasOne(d => d.IdEstadoNavigation).WithMany(p => p.Presupuestos)
                .HasForeignKey(d => d.IdEstado)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Presupuestos_Estados");
        });

        modelBuilder.Entity<PresupuestosDetalle>(entity =>
        {
            entity.HasKey(e => e.IdPresupuestoDetalle);

            entity.ToTable("Presupuestos_Detalles");

            entity.Property(e => e.IdPresupuestoDetalle).HasColumnName("Id_Presupuesto_Detalle");
            entity.Property(e => e.IdPresupuesto).HasColumnName("Id_Presupuesto");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.Iva)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("IVA");
            entity.Property(e => e.Subtotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdPresupuestoNavigation).WithMany(p => p.PresupuestosDetalles)
                .HasForeignKey(d => d.IdPresupuesto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Presupuestos_Detalles_Presupuestos");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.PresupuestosDetalles)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Presupuestos_Detalles_Productos");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.IdProducto);

            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.EsServicio).HasColumnName("Es_Servicio");
            entity.Property(e => e.IdCategoria).HasColumnName("Id_Categoria");
            entity.Property(e => e.IdMarca).HasColumnName("Id_Marca");
            entity.Property(e => e.PorcentajeIva)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("Porcentaje_IVA");
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Precio_Unitario");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdCategoria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Productos_Categorias");

            entity.HasOne(d => d.IdMarcaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdMarca)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Productos_Marcas");
        });

        modelBuilder.Entity<Proveedor>(entity =>
        {
            entity.HasKey(e => e.IdProveedor);

            entity.Property(e => e.IdProveedor)
                .ValueGeneratedOnAdd()
                .HasColumnName("Id_Proveedor");
            entity.Property(e => e.NombreFantasia)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Nombre_Fantasia");
            entity.Property(e => e.RazonSocial)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("Razon_Social");
            entity.Property(e => e.Ruc)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("RUC");

            entity.HasOne(d => d.IdProveedorNavigation).WithOne(p => p.Proveedor)
                .HasForeignKey<Proveedor>(d => d.IdProveedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Proveedores_Personas");
        });

        modelBuilder.Entity<StocksDeposito>(entity =>
        {
            entity.HasKey(e => e.IdDeposito);

            entity.ToTable("Stocks_Depositos");

            entity.Property(e => e.IdDeposito)
                .ValueGeneratedOnAdd()
                .HasColumnName("Id_Deposito");
            entity.Property(e => e.IdProducto).HasColumnName("Id_Producto");

            entity.HasOne(d => d.IdDepositoNavigation).WithOne(p => p.StocksDeposito)
                .HasForeignKey<StocksDeposito>(d => d.IdDeposito)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Stocks_Depositos_Depositos");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.StocksDepositos)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Stocks_Depositos_Productos");
        });

        modelBuilder.Entity<Timbrado>(entity =>
        {
            entity.HasKey(e => e.IdTimbrado);

            entity.Property(e => e.IdTimbrado).HasColumnName("Id_Timbrado");
            entity.Property(e => e.FechaFinal).HasColumnName("Fecha_Final");
            entity.Property(e => e.FechaInicio).HasColumnName("Fecha_Inicio");
            entity.Property(e => e.Ruc)
                .HasMaxLength(12)
                .IsUnicode(false)
                .HasColumnName("RUC");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
