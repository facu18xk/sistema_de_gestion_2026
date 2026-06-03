using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ChequeEmitidoService : CrudServiceBase<ChequeEmitido, int>
{
    private readonly DblosAmigosContext _context;
    private readonly MovimientoBancarioService _movimientoBancarioService;

    public ChequeEmitidoService(DblosAmigosContext context, MovimientoBancarioService movimientoBancarioService) : base(context)
    {
        _context = context;
        _movimientoBancarioService = movimientoBancarioService;
    }

    protected override DbSet<ChequeEmitido> Set => _context.ChequesEmitidos;

    protected override IQueryable<ChequeEmitido> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<ChequeEmitido> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<ChequeEmitido, bool>> BuildKeyPredicate(int id) => item => item.IdChequeEmitido == id;

    public override async Task<ChequeEmitido> CreateAsync(ChequeEmitido entity)
    {
        if (entity.Monto <= 0)
        {
            throw new InvalidOperationException("El monto del cheque debe ser mayor a cero.");
        }

        var cuenta = await _context.CuentasBancarias
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdCuentaBancaria == entity.IdCuentaBancaria);
        if (cuenta is null)
        {
            throw new InvalidOperationException("La cuenta bancaria indicada no existe.");
        }

        var numeroCheque = entity.NumeroCheque.Trim();
        var beneficiario = entity.Beneficiario.Trim();
        if (string.IsNullOrWhiteSpace(numeroCheque))
        {
            throw new InvalidOperationException("Debe indicar el numero de cheque.");
        }

        if (string.IsNullOrWhiteSpace(beneficiario))
        {
            throw new InvalidOperationException("Debe indicar el beneficiario del cheque.");
        }

        var chequeDuplicado = await _context.ChequesEmitidos
            .AsNoTracking()
            .AnyAsync(item => item.IdCuentaBancaria == entity.IdCuentaBancaria && item.NumeroCheque == numeroCheque);
        if (chequeDuplicado)
        {
            throw new InvalidOperationException("Ya existe un cheque con ese numero para la cuenta seleccionada.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        entity.NumeroCheque = numeroCheque;
        entity.Beneficiario = beneficiario;
        entity.FechaEmision = AsTimestampWithoutTimeZone(entity.FechaEmision);
        entity.Estado = string.IsNullOrWhiteSpace(entity.Estado) ? "Emitido" : entity.Estado.Trim();

        Set.Add(entity);
        await _context.SaveChangesAsync();

        if (entity.IdMovimientoBancario is null)
        {
            var movimiento = await _movimientoBancarioService.AddMovementAsync(
                entity.IdCuentaBancaria,
                "Debito",
                entity.FechaEmision,
                entity.Monto,
                $"Cheque emitido {entity.NumeroCheque} - {entity.Beneficiario}",
                entity.NumeroCheque,
                false,
                entity.IdOrdenMedioPagoCompra,
                entity.IdChequeEmitido);

            await _context.SaveChangesAsync();
            entity.IdMovimientoBancario = movimiento.IdMovimientoBancario;
            await _context.SaveChangesAsync();
        }

        await transaction.CommitAsync();
        return entity;
    }

    public async Task<ChequeEmitido> ConciliarAsync(int id, DateTime fechaPago)
    {
        fechaPago = AsTimestampWithoutTimeZone(fechaPago);

        var cheque = await Set
            .Include(item => item.IdCuentaBancariaNavigation)
            .Include(item => item.IdMovimientoBancarioNavigation)
            .FirstOrDefaultAsync(item => item.IdChequeEmitido == id);

        if (cheque is null)
        {
            throw new KeyNotFoundException($"No existe el cheque emitido con ID {id}");
        }

        if (TesoreriaText.Normalize(cheque.Estado) == "pagado")
        {
            throw new InvalidOperationException("El cheque ya fue conciliado.");
        }

        cheque.Estado = "Pagado";
        if (cheque.IdMovimientoBancarioNavigation is not null)
        {
            cheque.IdMovimientoBancarioNavigation.Fecha = fechaPago;
        }

        cheque.IdCuentaBancariaNavigation.SaldoDisponible -= cheque.Monto;
        await _context.SaveChangesAsync();
        return cheque;
    }

    protected override void UpdateEntity(ChequeEmitido existingEntity, ChequeEmitido incomingEntity)
    {
        if (TesoreriaText.Normalize(existingEntity.Estado) == "pagado")
        {
            throw new InvalidOperationException("No se puede modificar un cheque conciliado.");
        }

        existingEntity.IdCuentaBancaria = incomingEntity.IdCuentaBancaria;
        existingEntity.IdOrdenMedioPagoCompra = incomingEntity.IdOrdenMedioPagoCompra;
        existingEntity.IdMovimientoBancario = incomingEntity.IdMovimientoBancario;
        existingEntity.NumeroCheque = incomingEntity.NumeroCheque;
        existingEntity.Beneficiario = incomingEntity.Beneficiario;
        existingEntity.FechaEmision = AsTimestampWithoutTimeZone(incomingEntity.FechaEmision);
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Estado = incomingEntity.Estado;
    }

    private static DateTime AsTimestampWithoutTimeZone(DateTime value)
    {
        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    private IQueryable<ChequeEmitido> BuildQuery()
    {
        return _context.ChequesEmitidos
            .Include(item => item.IdCuentaBancariaNavigation)
            .OrderByDescending(item => item.FechaEmision)
            .ThenByDescending(item => item.IdChequeEmitido);
    }
}
