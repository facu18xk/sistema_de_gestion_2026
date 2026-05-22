using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class MovimientoBancarioService : CrudServiceBase<MovimientoBancario, int>
{
    private readonly DblosAmigosContext _context;

    public MovimientoBancarioService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<MovimientoBancario> Set => _context.MovimientosBancarios;

    protected override IQueryable<MovimientoBancario> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<MovimientoBancario> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<MovimientoBancario, bool>> BuildKeyPredicate(int id) => item => item.IdMovimientoBancario == id;

    public override async Task<MovimientoBancario> CreateAsync(MovimientoBancario entity)
    {
        await ApplyBalanceAsync(entity, entity.Monto);
        Set.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public override async Task<MovimientoBancario> UpdateAsync(int id, MovimientoBancario entity)
    {
        var existing = await Set.FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (existing is null)
        {
            throw new KeyNotFoundException($"No existe el movimiento bancario con ID {id}");
        }

        await ApplyBalanceAsync(existing, -existing.Monto);
        UpdateEntity(existing, entity);
        await ApplyBalanceAsync(existing, existing.Monto);
        await _context.SaveChangesAsync();
        return existing;
    }

    public override async Task DeleteAsync(int id)
    {
        var existing = await Set.FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (existing is null)
        {
            return;
        }

        await ApplyBalanceAsync(existing, -existing.Monto);
        Set.Remove(existing);
        await _context.SaveChangesAsync();
    }

    protected override void UpdateEntity(MovimientoBancario existingEntity, MovimientoBancario incomingEntity)
    {
        existingEntity.IdCuentaBancaria = incomingEntity.IdCuentaBancaria;
        existingEntity.IdTipoMovimientoBancario = incomingEntity.IdTipoMovimientoBancario;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Concepto = incomingEntity.Concepto;
        existingEntity.Referencia = incomingEntity.Referencia;
    }

    internal async Task<MovimientoBancario> AddMovementAsync(
        int idCuentaBancaria,
        string tipoMovimiento,
        DateTime fecha,
        decimal monto,
        string concepto,
        string? referencia,
        bool afectaDisponible,
        int? idOrdenMedioPagoCompra = null,
        int? idChequeEmitido = null)
    {
        var tipo = await GetTipoMovimientoAsync(tipoMovimiento);
        var movimiento = new MovimientoBancario
        {
            IdCuentaBancaria = idCuentaBancaria,
            IdTipoMovimientoBancario = tipo.IdTipoMovimientoBancario,
            Fecha = fecha,
            Monto = monto,
            Concepto = concepto,
            Referencia = referencia,
            IdOrdenMedioPagoCompra = idOrdenMedioPagoCompra,
            IdChequeEmitido = idChequeEmitido
        };

        await ApplyBalanceAsync(movimiento, movimiento.Monto, afectaDisponible);
        Set.Add(movimiento);
        return movimiento;
    }

    internal async Task ApplyBalanceAsync(MovimientoBancario movimiento, decimal monto, bool afectaDisponible = true)
    {
        var cuenta = await _context.CuentasBancarias.FirstOrDefaultAsync(item => item.IdCuentaBancaria == movimiento.IdCuentaBancaria);
        if (cuenta is null)
        {
            throw new InvalidOperationException("La cuenta bancaria indicada no existe.");
        }

        var tipo = await _context.TiposMovimientosBancarios
            .FirstOrDefaultAsync(item => item.IdTipoMovimientoBancario == movimiento.IdTipoMovimientoBancario);
        if (tipo is null)
        {
            throw new InvalidOperationException("El tipo de movimiento bancario indicado no existe.");
        }

        var multiplier = TesoreriaText.Normalize(tipo.Nombre) == "debito" ? -1 : 1;
        cuenta.Saldo += multiplier * monto;
        if (afectaDisponible)
        {
            cuenta.SaldoDisponible += multiplier * monto;
        }
    }

    private async Task<TipoMovimientoBancario> GetTipoMovimientoAsync(string nombre)
    {
        var normalized = TesoreriaText.Normalize(nombre);
        var tipos = await _context.TiposMovimientosBancarios.ToListAsync();
        return tipos.FirstOrDefault(item => TesoreriaText.Normalize(item.Nombre) == normalized)
            ?? throw new InvalidOperationException($"No existe el tipo de movimiento bancario {nombre}.");
    }

    private IQueryable<MovimientoBancario> BuildQuery()
    {
        return _context.MovimientosBancarios
            .Include(item => item.IdCuentaBancariaNavigation)
            .Include(item => item.IdTipoMovimientoBancarioNavigation)
            .Include(item => item.IdEstadoNavigation)
            .OrderByDescending(item => item.Fecha)
            .ThenByDescending(item => item.IdMovimientoBancario);
    }
}
