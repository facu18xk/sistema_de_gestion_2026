using Microsoft.EntityFrameworkCore;

namespace api.Models;

public partial class DblosAmigosContext
{
    public virtual DbSet<Banco> Bancos { get; set; }

    public virtual DbSet<CuentaBancaria> CuentasBancarias { get; set; }

    public virtual DbSet<TipoCuentaBancaria> TiposCuentasBancarias { get; set; }

    public virtual DbSet<MovimientoBancario> MovimientosBancarios { get; set; }

    public virtual DbSet<TipoMovimientoBancario> TiposMovimientosBancarios { get; set; }

    public virtual DbSet<ChequeEmitido> ChequesEmitidos { get; set; }

    public virtual DbSet<DepositoBancario> DepositosBancarios { get; set; }

    public virtual DbSet<TipoDepositoBancario> TiposDepositosBancarios { get; set; }

    public virtual DbSet<DetalleDepositoBancario> DetallesDepositosBancarios { get; set; }

    public virtual DbSet<ChequeMismoBanco> ChequesMismoBanco { get; set; }

    public virtual DbSet<ChequeTercero> ChequesTerceros { get; set; }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Banco>(entity =>
        {
            entity.HasKey(e => e.IdBanco);
            entity.ToTable("Bancos");
            entity.Property(e => e.IdBanco).HasColumnName("Id_Banco");
            entity.Property(e => e.Nombre).HasMaxLength(120).IsUnicode(false);
            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.HasIndex(e => e.Nombre).IsUnique().HasDatabaseName("IX_Bancos_Nombre");
        });

        modelBuilder.Entity<TipoCuentaBancaria>(entity =>
        {
            entity.HasKey(e => e.IdTipoCuentaBancaria);
            entity.ToTable("Tipos_Cuentas_Bancarias");
            entity.Property(e => e.IdTipoCuentaBancaria).HasColumnName("Id_Tipo_Cuenta_Bancaria");
            entity.Property(e => e.Nombre).HasMaxLength(80).IsUnicode(false);
            entity.HasIndex(e => e.Nombre).IsUnique().HasDatabaseName("IX_Tipos_Cuentas_Bancarias_Nombre");
            entity.HasData(
                new TipoCuentaBancaria { IdTipoCuentaBancaria = 1, Nombre = "Corriente" },
                new TipoCuentaBancaria { IdTipoCuentaBancaria = 2, Nombre = "Ahorro" });
        });

        modelBuilder.Entity<CuentaBancaria>(entity =>
        {
            entity.HasKey(e => e.IdCuentaBancaria);
            entity.ToTable("Cuentas_Bancarias");
            entity.Property(e => e.IdCuentaBancaria).HasColumnName("Id_Cuenta_Bancaria");
            entity.Property(e => e.IdBanco).HasColumnName("Id_Banco");
            entity.Property(e => e.IdTipoCuentaBancaria).HasColumnName("Id_Tipo_Cuenta_Bancaria");
            entity.Property(e => e.IdCuentaContable).HasColumnName("Id_Cuenta_Contable");
            entity.Property(e => e.NumeroCuenta).HasMaxLength(80).IsUnicode(false).HasColumnName("Numero_Cuenta");
            entity.Property(e => e.Moneda).HasMaxLength(10).IsUnicode(false).HasDefaultValue("PYG");
            entity.Property(e => e.Saldo).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SaldoDisponible).HasColumnType("decimal(18, 2)").HasColumnName("Saldo_Disponible");
            entity.Property(e => e.Activa).HasDefaultValue(true);
            entity.HasIndex(e => new { e.IdBanco, e.NumeroCuenta }).IsUnique().HasDatabaseName("IX_Cuentas_Bancarias_Banco_Numero");

            entity.HasOne(e => e.IdBancoNavigation).WithMany(e => e.CuentasBancarias)
                .HasForeignKey(e => e.IdBanco)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cuentas_Bancarias_Bancos");

            entity.HasOne(e => e.IdTipoCuentaBancariaNavigation).WithMany(e => e.CuentasBancarias)
                .HasForeignKey(e => e.IdTipoCuentaBancaria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cuentas_Bancarias_Tipos_Cuentas_Bancarias");

            entity.HasOne(e => e.IdCuentaContableNavigation).WithMany()
                .HasForeignKey(e => e.IdCuentaContable)
                .HasConstraintName("FK_Cuentas_Bancarias_Cuentas_Contables");
        });

        modelBuilder.Entity<TipoMovimientoBancario>(entity =>
        {
            entity.HasKey(e => e.IdTipoMovimientoBancario);
            entity.ToTable("Tipos_Movimientos_Bancarios");
            entity.Property(e => e.IdTipoMovimientoBancario).HasColumnName("Id_Tipo_Movimiento_Bancario");
            entity.Property(e => e.Nombre).HasMaxLength(40).IsUnicode(false);
            entity.HasIndex(e => e.Nombre).IsUnique().HasDatabaseName("IX_Tipos_Movimientos_Bancarios_Nombre");
            entity.HasData(
                new TipoMovimientoBancario { IdTipoMovimientoBancario = 1, Nombre = "Débito" },
                new TipoMovimientoBancario { IdTipoMovimientoBancario = 2, Nombre = "Crédito" });
        });

        modelBuilder.Entity<MovimientoBancario>(entity =>
        {
            entity.HasKey(e => e.IdMovimientoBancario);
            entity.ToTable("Movimientos_Bancarios");
            entity.Property(e => e.IdMovimientoBancario).HasColumnName("Id_Movimiento_Bancario");
            entity.Property(e => e.IdCuentaBancaria).HasColumnName("Id_Cuenta_Bancaria");
            entity.Property(e => e.IdTipoMovimientoBancario).HasColumnName("Id_Tipo_Movimiento_Bancario");
            entity.Property(e => e.IdEstado).HasColumnName("Id_Estado");
            entity.Property(e => e.IdOrdenMedioPagoCompra).HasColumnName("Id_Orden_Medio_Pago_Compra");
            entity.Property(e => e.IdChequeEmitido).HasColumnName("Id_Cheque_Emitido");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Concepto).HasMaxLength(250).IsUnicode(false);
            entity.Property(e => e.Referencia).HasMaxLength(120).IsUnicode(false);

            entity.HasOne(e => e.IdCuentaBancariaNavigation).WithMany(e => e.MovimientosBancarios)
                .HasForeignKey(e => e.IdCuentaBancaria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Movimientos_Bancarios_Cuentas_Bancarias");
            entity.HasOne(e => e.IdTipoMovimientoBancarioNavigation).WithMany(e => e.MovimientosBancarios)
                .HasForeignKey(e => e.IdTipoMovimientoBancario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Movimientos_Bancarios_Tipos_Movimientos_Bancarios");
            entity.HasOne(e => e.IdEstadoNavigation).WithMany()
                .HasForeignKey(e => e.IdEstado)
                .HasConstraintName("FK_Movimientos_Bancarios_Estados");
            entity.HasOne(e => e.IdOrdenMedioPagoCompraNavigation).WithMany()
                .HasForeignKey(e => e.IdOrdenMedioPagoCompra)
                .HasConstraintName("FK_Movimientos_Bancarios_Ordenes_Medios_Pagos_Compras");
            entity.HasOne(e => e.IdChequeEmitidoNavigation).WithMany()
                .HasForeignKey(e => e.IdChequeEmitido)
                .HasConstraintName("FK_Movimientos_Bancarios_Cheques_Emitidos");
        });

        modelBuilder.Entity<ChequeEmitido>(entity =>
        {
            entity.HasKey(e => e.IdChequeEmitido);
            entity.ToTable("Cheques_Emitidos");
            entity.Property(e => e.IdChequeEmitido).HasColumnName("Id_Cheque_Emitido");
            entity.Property(e => e.IdCuentaBancaria).HasColumnName("Id_Cuenta_Bancaria");
            entity.Property(e => e.IdOrdenMedioPagoCompra).HasColumnName("Id_Orden_Medio_Pago_Compra");
            entity.Property(e => e.IdMovimientoBancario).HasColumnName("Id_Movimiento_Bancario");
            entity.Property(e => e.NumeroCheque).HasMaxLength(80).IsUnicode(false).HasColumnName("Numero_Cheque");
            entity.Property(e => e.Beneficiario).HasMaxLength(180).IsUnicode(false);
            entity.Property(e => e.FechaEmision).HasColumnType("timestamp without time zone").HasColumnName("Fecha_Emision");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Estado).HasMaxLength(40).IsUnicode(false);
            entity.HasIndex(e => new { e.IdCuentaBancaria, e.NumeroCheque }).IsUnique().HasDatabaseName("IX_Cheques_Emitidos_Cuenta_Numero");

            entity.HasOne(e => e.IdCuentaBancariaNavigation).WithMany(e => e.ChequesEmitidos)
                .HasForeignKey(e => e.IdCuentaBancaria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cheques_Emitidos_Cuentas_Bancarias");
            entity.HasOne(e => e.IdOrdenMedioPagoCompraNavigation).WithMany()
                .HasForeignKey(e => e.IdOrdenMedioPagoCompra)
                .HasConstraintName("FK_Cheques_Emitidos_Ordenes_Medios_Pagos_Compras");
            entity.HasOne(e => e.IdMovimientoBancarioNavigation).WithMany()
                .HasForeignKey(e => e.IdMovimientoBancario)
                .HasConstraintName("FK_Cheques_Emitidos_Movimientos_Bancarios");
        });

        modelBuilder.Entity<TipoDepositoBancario>(entity =>
        {
            entity.HasKey(e => e.IdTipoDepositoBancario);
            entity.ToTable("Tipos_Depositos_Bancarios");
            entity.Property(e => e.IdTipoDepositoBancario).HasColumnName("Id_Tipo_Deposito_Bancario");
            entity.Property(e => e.Nombre).HasMaxLength(80).IsUnicode(false);
            entity.HasIndex(e => e.Nombre).IsUnique().HasDatabaseName("IX_Tipos_Depositos_Bancarios_Nombre");
            entity.HasData(
                new TipoDepositoBancario { IdTipoDepositoBancario = 1, Nombre = "Efectivo" },
                new TipoDepositoBancario { IdTipoDepositoBancario = 2, Nombre = "Cheque mismo banco" },
                new TipoDepositoBancario { IdTipoDepositoBancario = 3, Nombre = "Cheque terceros" });
        });

        modelBuilder.Entity<DepositoBancario>(entity =>
        {
            entity.HasKey(e => e.IdDepositoBancario);
            entity.ToTable("Depositos_Bancarios");
            entity.Property(e => e.IdDepositoBancario).HasColumnName("Id_Deposito_Bancario");
            entity.Property(e => e.IdCuentaBancaria).HasColumnName("Id_Cuenta_Bancaria");
            entity.Property(e => e.IdTipoDepositoBancario).HasColumnName("Id_Tipo_Deposito_Bancario");
            entity.Property(e => e.IdMovimientoBancario).HasColumnName("Id_Movimiento_Bancario");
            entity.Property(e => e.Fecha).HasColumnType("timestamp without time zone");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Concepto).HasMaxLength(250).IsUnicode(false);
            entity.Property(e => e.Estado).HasMaxLength(40).IsUnicode(false);

            entity.HasOne(e => e.IdCuentaBancariaNavigation).WithMany(e => e.DepositosBancarios)
                .HasForeignKey(e => e.IdCuentaBancaria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Depositos_Bancarios_Cuentas_Bancarias");
            entity.HasOne(e => e.IdTipoDepositoBancarioNavigation).WithMany(e => e.DepositosBancarios)
                .HasForeignKey(e => e.IdTipoDepositoBancario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Depositos_Bancarios_Tipos_Depositos_Bancarios");
            entity.HasOne(e => e.IdMovimientoBancarioNavigation).WithMany()
                .HasForeignKey(e => e.IdMovimientoBancario)
                .HasConstraintName("FK_Depositos_Bancarios_Movimientos_Bancarios");
        });

        modelBuilder.Entity<DetalleDepositoBancario>(entity =>
        {
            entity.HasKey(e => e.IdDetalleDepositoBancario);
            entity.ToTable("Detalles_Depositos_Bancarios");
            entity.Property(e => e.IdDetalleDepositoBancario).HasColumnName("Id_Detalle_Deposito_Bancario");
            entity.Property(e => e.IdDepositoBancario).HasColumnName("Id_Deposito_Bancario");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Descripcion).HasMaxLength(250).IsUnicode(false);
            entity.HasOne(e => e.IdDepositoBancarioNavigation).WithMany(e => e.DetallesDepositosBancarios)
                .HasForeignKey(e => e.IdDepositoBancario)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Detalles_Depositos_Bancarios_Depositos_Bancarios");
        });

        modelBuilder.Entity<ChequeMismoBanco>(entity =>
        {
            entity.HasKey(e => e.IdChequeMismoBanco);
            entity.ToTable("Cheques_Mismo_Banco");
            entity.Property(e => e.IdChequeMismoBanco).HasColumnName("Id_Cheque_Mismo_Banco");
            entity.Property(e => e.IdDepositoBancario).HasColumnName("Id_Deposito_Bancario");
            entity.Property(e => e.NumeroCheque).HasMaxLength(80).IsUnicode(false).HasColumnName("Numero_Cheque");
            entity.Property(e => e.Librador).HasMaxLength(180).IsUnicode(false);
            entity.Property(e => e.FechaEmision).HasColumnType("timestamp without time zone").HasColumnName("Fecha_Emision");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.HasOne(e => e.IdDepositoBancarioNavigation).WithMany(e => e.ChequesMismoBanco)
                .HasForeignKey(e => e.IdDepositoBancario)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Cheques_Mismo_Banco_Depositos_Bancarios");
        });

        modelBuilder.Entity<ChequeTercero>(entity =>
        {
            entity.HasKey(e => e.IdChequeTercero);
            entity.ToTable("Cheques_Terceros");
            entity.Property(e => e.IdChequeTercero).HasColumnName("Id_Cheque_Tercero");
            entity.Property(e => e.IdDepositoBancario).HasColumnName("Id_Deposito_Bancario");
            entity.Property(e => e.BancoEmisor).HasMaxLength(120).IsUnicode(false).HasColumnName("Banco_Emisor");
            entity.Property(e => e.NumeroCheque).HasMaxLength(80).IsUnicode(false).HasColumnName("Numero_Cheque");
            entity.Property(e => e.Librador).HasMaxLength(180).IsUnicode(false);
            entity.Property(e => e.FechaEmision).HasColumnType("timestamp without time zone").HasColumnName("Fecha_Emision");
            entity.Property(e => e.Monto).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Estado).HasMaxLength(40).IsUnicode(false);
            entity.HasOne(e => e.IdDepositoBancarioNavigation).WithMany(e => e.ChequesTerceros)
                .HasForeignKey(e => e.IdDepositoBancario)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Cheques_Terceros_Depositos_Bancarios");
        });
    }
}
