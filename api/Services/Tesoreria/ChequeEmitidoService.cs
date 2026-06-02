using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ChequeEmitidoService : CrudServiceBase<ChequeEmitido, int>
{
    private readonly DblosAmigosContext _context;

    public ChequeEmitidoService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<ChequeEmitido> Set => _context.ChequesEmitidos;

    protected override IQueryable<ChequeEmitido> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<ChequeEmitido> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<ChequeEmitido, bool>> BuildKeyPredicate(int id) => item => item.IdChequeEmitido == id;

    public async Task<ChequeEmitido> ConciliarAsync(int id, DateTime fechaPago)
    {
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
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Estado = incomingEntity.Estado;
    }

    private IQueryable<ChequeEmitido> BuildQuery()
    {
        return _context.ChequesEmitidos
            .Include(item => item.IdCuentaBancariaNavigation)
            .OrderByDescending(item => item.FechaEmision)
            .ThenByDescending(item => item.IdChequeEmitido);
    }
}
