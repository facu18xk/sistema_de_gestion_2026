using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TipoCuentaBancariaService : CrudServiceBase<TipoCuentaBancaria, int>
{
    private readonly DblosAmigosContext _context;

    public TipoCuentaBancariaService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<TipoCuentaBancaria> Set => _context.TiposCuentasBancarias;

    protected override IQueryable<TipoCuentaBancaria> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Nombre);

    protected override Expression<Func<TipoCuentaBancaria, bool>> BuildKeyPredicate(int id) => item => item.IdTipoCuentaBancaria == id;

    protected override void UpdateEntity(TipoCuentaBancaria existingEntity, TipoCuentaBancaria incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
