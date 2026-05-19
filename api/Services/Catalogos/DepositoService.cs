using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class DepositoService : CrudServiceBase<Deposito, int>
{
    private readonly DblosAmigosContext _context;

    public DepositoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Deposito> Set => _context.Depositos;

    protected override IQueryable<Deposito> BuildReadQuery()
    {
        return _context.Depositos.AsNoTracking();
    }

    protected override Expression<Func<Deposito, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdDeposito == id;
    }

    protected override void UpdateEntity(Deposito existingEntity, Deposito incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
