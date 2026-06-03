using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class DepositoBancarioService : CrudServiceBase<DepositoBancario, int>
{
    private readonly DblosAmigosContext _context;
    private readonly MovimientoBancarioService _movimientoBancarioService;

    public DepositoBancarioService(DblosAmigosContext context, MovimientoBancarioService movimientoBancarioService)
        : base(context)
    {
        _context = context;
        _movimientoBancarioService = movimientoBancarioService;
    }

    protected override DbSet<DepositoBancario> Set => _context.DepositosBancarios;

    protected override IQueryable<DepositoBancario> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<DepositoBancario> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<DepositoBancario, bool>> BuildKeyPredicate(int id) => item => item.IdDepositoBancario == id;

    public override async Task<DepositoBancario> CreateAsync(DepositoBancario entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var afectaDisponible = await DepositoAfectaDisponibleAsync(entity.IdTipoDepositoBancario);
        entity.Fecha = AsTimestampWithoutTimeZone(entity.Fecha);
        var movimiento = await _movimientoBancarioService.AddMovementAsync(
            entity.IdCuentaBancaria,
            "Credito",
            entity.Fecha,
            entity.Monto,
            entity.Concepto,
            $"Deposito bancario {entity.IdDepositoBancario}",
            afectaDisponible);

        entity.IdMovimientoBancarioNavigation = movimiento;
        entity.Estado = afectaDisponible ? "Confirmado" : "Pendiente";
        Set.Add(entity);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return entity;
    }

    public async Task<DepositoBancario> ConfirmarAsync(int id)
    {
        var deposito = await Set
            .Include(item => item.IdCuentaBancariaNavigation)
            .FirstOrDefaultAsync(item => item.IdDepositoBancario == id);
        if (deposito is null)
        {
            throw new KeyNotFoundException($"No existe el deposito bancario con ID {id}");
        }

        if (TesoreriaText.Normalize(deposito.Estado) == "confirmado")
        {
            throw new InvalidOperationException("El deposito ya fue confirmado.");
        }

        deposito.Estado = "Confirmado";
        deposito.IdCuentaBancariaNavigation.SaldoDisponible += deposito.Monto;
        await _context.SaveChangesAsync();
        return deposito;
    }

    public async Task<DepositoBancario> RechazarAsync(int id)
    {
        var deposito = await Set.FirstOrDefaultAsync(item => item.IdDepositoBancario == id);
        if (deposito is null)
        {
            throw new KeyNotFoundException($"No existe el deposito bancario con ID {id}");
        }

        if (TesoreriaText.Normalize(deposito.Estado) == "rechazado")
        {
            throw new InvalidOperationException("El deposito ya fue rechazado.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        deposito.Estado = "Rechazado";
        await _movimientoBancarioService.AddMovementAsync(
            deposito.IdCuentaBancaria,
            "Debito",
            DateTime.Now,
            deposito.Monto,
            $"Reversion de deposito bancario {deposito.IdDepositoBancario}",
            deposito.IdDepositoBancario.ToString(),
            false);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return deposito;
    }

    protected override void UpdateEntity(DepositoBancario existingEntity, DepositoBancario incomingEntity)
    {
        existingEntity.IdCuentaBancaria = incomingEntity.IdCuentaBancaria;
        existingEntity.IdTipoDepositoBancario = incomingEntity.IdTipoDepositoBancario;
        existingEntity.Fecha = AsTimestampWithoutTimeZone(incomingEntity.Fecha);
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Concepto = incomingEntity.Concepto;
    }

    private static DateTime AsTimestampWithoutTimeZone(DateTime value)
    {
        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    private async Task<bool> DepositoAfectaDisponibleAsync(int idTipoDepositoBancario)
    {
        var tipo = await _context.TiposDepositosBancarios.FirstOrDefaultAsync(item => item.IdTipoDepositoBancario == idTipoDepositoBancario);
        if (tipo is null)
        {
            throw new InvalidOperationException("El tipo de deposito bancario indicado no existe.");
        }

        var normalized = TesoreriaText.Normalize(tipo.Nombre);
        return normalized == "efectivo" || normalized == "cheque mismo banco";
    }

    private IQueryable<DepositoBancario> BuildQuery()
    {
        return _context.DepositosBancarios
            .Include(item => item.IdCuentaBancariaNavigation)
            .Include(item => item.IdTipoDepositoBancarioNavigation)
            .OrderByDescending(item => item.Fecha)
            .ThenByDescending(item => item.IdDepositoBancario);
    }
}
