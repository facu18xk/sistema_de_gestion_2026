using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ChequeMismoBancoService : CrudServiceBase<ChequeMismoBanco, int>
{
    private readonly DblosAmigosContext _context;

    public ChequeMismoBancoService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<ChequeMismoBanco> Set => _context.ChequesMismoBanco;

    protected override IQueryable<ChequeMismoBanco> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.IdChequeMismoBanco);

    protected override Expression<Func<ChequeMismoBanco, bool>> BuildKeyPredicate(int id) => item => item.IdChequeMismoBanco == id;

    protected override void UpdateEntity(ChequeMismoBanco existingEntity, ChequeMismoBanco incomingEntity)
    {
        existingEntity.IdDepositoBancario = incomingEntity.IdDepositoBancario;
        existingEntity.NumeroCheque = incomingEntity.NumeroCheque;
        existingEntity.Librador = incomingEntity.Librador;
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Monto = incomingEntity.Monto;
    }
}
