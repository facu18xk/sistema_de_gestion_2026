using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ChequeTerceroService : CrudServiceBase<ChequeTercero, int>
{
    private readonly DblosAmigosContext _context;

    public ChequeTerceroService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<ChequeTercero> Set => _context.ChequesTerceros;

    protected override IQueryable<ChequeTercero> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.IdChequeTercero);

    protected override Expression<Func<ChequeTercero, bool>> BuildKeyPredicate(int id) => item => item.IdChequeTercero == id;

    protected override void UpdateEntity(ChequeTercero existingEntity, ChequeTercero incomingEntity)
    {
        existingEntity.IdDepositoBancario = incomingEntity.IdDepositoBancario;
        existingEntity.BancoEmisor = incomingEntity.BancoEmisor;
        existingEntity.NumeroCheque = incomingEntity.NumeroCheque;
        existingEntity.Librador = incomingEntity.Librador;
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Estado = incomingEntity.Estado;
    }
}
