using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BancoService : CrudServiceBase<Banco, int>
{
    private readonly DblosAmigosContext _context;

    public BancoService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<Banco> Set => _context.Bancos;

    protected override IQueryable<Banco> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Nombre);

    protected override Expression<Func<Banco, bool>> BuildKeyPredicate(int id) => item => item.IdBanco == id;

    protected override void UpdateEntity(Banco existingEntity, Banco incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
        existingEntity.Activo = incomingEntity.Activo;
    }
}
