using System.Linq.Expressions;
<<<<<<< HEAD
using api.Dtos.AsientosDetalles;
using api.Dtos.Contabilidad;
=======
>>>>>>> front
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesMediosPagosCompraService : CrudServiceBase<OrdenesMediosPagosCompra, int>
{
    private readonly DblosAmigosContext _context;
<<<<<<< HEAD
    private readonly MovimientoBancarioService _movimientoBancarioService;
    private readonly IAsientoContableService _asientoContableService;

    public OrdenesMediosPagosCompraService(
        DblosAmigosContext context,
        MovimientoBancarioService movimientoBancarioService,
        IAsientoContableService asientoContableService)
        : base(context)
    {
        _context = context;
        _movimientoBancarioService = movimientoBancarioService;
        _asientoContableService = asientoContableService;
=======

    public OrdenesMediosPagosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
>>>>>>> front
    }

    protected override DbSet<OrdenesMediosPagosCompra> Set => _context.OrdenesMediosPagosCompras;

    protected override IQueryable<OrdenesMediosPagosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesMediosPagosCompra> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<OrdenesMediosPagosCompra, bool>> BuildKeyPredicate(int id)
    {
        return detalle => detalle.IdOrdenMedioPagoCompra == id;
    }

    protected override void UpdateEntity(OrdenesMediosPagosCompra existingEntity, OrdenesMediosPagosCompra incomingEntity)
    {
        existingEntity.IdOrdenPagoCompra = incomingEntity.IdOrdenPagoCompra;
        existingEntity.IdMedioPagoCompra = incomingEntity.IdMedioPagoCompra;
        existingEntity.Monto = incomingEntity.Monto;
    }

<<<<<<< HEAD
    public override async Task<OrdenesMediosPagosCompra> CreateAsync(OrdenesMediosPagosCompra entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        Set.Add(entity);
        await _context.SaveChangesAsync();

        var medioPago = await _context.MediosPagosCompras
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdMedioPagoCompra == entity.IdMedioPagoCompra);
        if (medioPago is null)
        {
            throw new InvalidOperationException("El medio de pago indicado no existe.");
        }

        var medioPagoNormalizado = TesoreriaText.Normalize(medioPago.Nombre);
        if (medioPagoNormalizado.Contains("cheque"))
        {
            await CreateChequePaymentAsync(entity);
        }
        else if (medioPagoNormalizado.Contains("transferencia"))
        {
            await CreateTransferPaymentAsync(entity);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        if (medioPagoNormalizado.Contains("cheque") || medioPagoNormalizado.Contains("transferencia"))
        {
            await TryGenerateAccountingEntryAsync(entity, medioPago.Nombre);
        }

        return entity;
    }

=======
>>>>>>> front
    public override async Task<OrdenesMediosPagosCompra> UpdateAsync(int id, OrdenesMediosPagosCompra entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro de medio de pago con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return existingEntity;
    }

    public override async Task DeleteAsync(int id)
    {
        var entity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private IQueryable<OrdenesMediosPagosCompra> BuildQuery()
    {
        return _context.OrdenesMediosPagosCompras
            .Include(o => o.IdOrdenPagoCompraNavigation)
<<<<<<< HEAD
            .ThenInclude(o => o.IdProveedorNavigation)
            .Include(o => o.IdMedioPagoCompraNavigation);
    }

    private async Task CreateChequePaymentAsync(OrdenesMediosPagosCompra entity)
    {
        if (entity.IdCuentaBancaria is null)
        {
            throw new InvalidOperationException("Debe indicar la cuenta bancaria para pagos con cheque.");
        }

        if (string.IsNullOrWhiteSpace(entity.NumeroCheque))
        {
            throw new InvalidOperationException("Debe indicar el numero de cheque para pagos con cheque.");
        }

        var beneficiario = entity.Beneficiario;
        if (string.IsNullOrWhiteSpace(beneficiario))
        {
            var orden = await _context.OrdenesPagosCompras
                .Include(item => item.IdProveedorNavigation)
                .FirstOrDefaultAsync(item => item.IdOrdenPagoCompra == entity.IdOrdenPagoCompra);
            beneficiario = orden?.IdProveedorNavigation?.RazonSocial ?? "Proveedor";
        }

        var cheque = new ChequeEmitido
        {
            IdCuentaBancaria = entity.IdCuentaBancaria.Value,
            IdOrdenMedioPagoCompra = entity.IdOrdenMedioPagoCompra,
            NumeroCheque = entity.NumeroCheque,
            Beneficiario = beneficiario,
            FechaEmision = DateTime.Now,
            Monto = entity.Monto,
            Estado = "Emitido"
        };
        _context.ChequesEmitidos.Add(cheque);
        await _context.SaveChangesAsync();

        var movimiento = await _movimientoBancarioService.AddMovementAsync(
            entity.IdCuentaBancaria.Value,
            "Debito",
            DateTime.Now,
            entity.Monto,
            $"Pago a proveedor por cheque {entity.NumeroCheque}",
            entity.ReferenciaBancaria,
            false,
            entity.IdOrdenMedioPagoCompra,
            cheque.IdChequeEmitido);

        await _context.SaveChangesAsync();
        cheque.IdMovimientoBancario = movimiento.IdMovimientoBancario;
        entity.IdChequeEmitido = cheque.IdChequeEmitido;
        entity.IdMovimientoBancario = movimiento.IdMovimientoBancario;
    }

    private async Task CreateTransferPaymentAsync(OrdenesMediosPagosCompra entity)
    {
        if (entity.IdCuentaBancaria is null)
        {
            throw new InvalidOperationException("Debe indicar la cuenta bancaria para pagos por transferencia.");
        }

        var movimiento = await _movimientoBancarioService.AddMovementAsync(
            entity.IdCuentaBancaria.Value,
            "Debito",
            DateTime.Now,
            entity.Monto,
            "Pago a proveedor por transferencia bancaria",
            entity.ReferenciaBancaria,
            true,
            entity.IdOrdenMedioPagoCompra);

        await _context.SaveChangesAsync();
        entity.IdMovimientoBancario = movimiento.IdMovimientoBancario;
    }

    private async Task TryGenerateAccountingEntryAsync(OrdenesMediosPagosCompra entity, string medioPagoNombre)
    {
        var existing = await _context.Asientos
            .AnyAsync(item => item.ReferenciaOrigen == "OrdenPagoCompra" && item.IdOrigen == entity.IdOrdenMedioPagoCompra);
        if (existing)
        {
            return;
        }

        var orden = await _context.OrdenesPagosCompras
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdOrdenPagoCompra == entity.IdOrdenPagoCompra);
        if (orden is null)
        {
            return;
        }

        var proceso = await _context.ProcesosContables
            .AsNoTracking()
            .Where(item => item.PeriodoAnho == orden.Fecha.Year)
            .OrderBy(item => item.IdProcesoContable)
            .FirstOrDefaultAsync();
        if (proceso is null)
        {
            return;
        }

        var proveedores = await FindCuentaAsync(proceso.IdProcesoContable, "Proveedores");
        var banco = entity.IdCuentaBancaria is null
            ? null
            : await _context.CuentasBancarias
                .AsNoTracking()
                .Where(item => item.IdCuentaBancaria == entity.IdCuentaBancaria.Value)
                .Select(item => item.IdCuentaContable)
                .FirstOrDefaultAsync();
        banco ??= (await FindCuentaAsync(proceso.IdProcesoContable, "Banco Cuenta Corriente"))?.IdCuentaContable;

        if (proveedores is null || banco is null)
        {
            return;
        }

        var modulo = await _context.Modulos
            .AsNoTracking()
            .Where(item => item.Nombre.ToLower() == "compras")
            .Select(item => (int?)item.IdModulo)
            .FirstOrDefaultAsync();

        await _asientoContableService.CreateManualAsync(new AsientoCompletoUpsertDto
        {
            IdModulo = modulo,
            Fecha = DateOnly.FromDateTime(orden.Fecha),
            Descripcion = $"Pago a proveedor por {medioPagoNombre}",
            Automatico = true,
            Estado = ContabilidadEstados.Registrado,
            ReferenciaOrigen = "OrdenPagoCompra",
            IdOrigen = entity.IdOrdenMedioPagoCompra,
            Detalles =
            [
                new AsientosDetalleUpsertDto
                {
                    IdCuentaContable = proveedores.IdCuentaContable,
                    Item = 1,
                    TipoMovimiento = "Debe",
                    Monto = entity.Monto,
                    DescripcionItem = "Cancelacion de proveedores"
                },
                new AsientosDetalleUpsertDto
                {
                    IdCuentaContable = banco.Value,
                    Item = 2,
                    TipoMovimiento = "Haber",
                    Monto = entity.Monto,
                    DescripcionItem = "Salida bancaria"
                }
            ]
        });
    }

    private async Task<CuentaContable?> FindCuentaAsync(int idProcesoContable, string nombre)
    {
        var normalized = TesoreriaText.Normalize(nombre);
        var cuentas = await _context.CuentasContables
            .AsNoTracking()
            .Where(item => item.IdProcesoContable == idProcesoContable && item.EsAsentable && item.Activa)
            .ToListAsync();

        return cuentas.FirstOrDefault(item => TesoreriaText.Normalize(item.Nombre) == normalized);
    }
}
=======
            .Include(o => o.IdMedioPagoCompraNavigation);
    }
}
>>>>>>> front
