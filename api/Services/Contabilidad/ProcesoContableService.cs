using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ProcesoContableService : CrudServiceBase<ProcesoContable, int>
{
    private readonly DblosAmigosContext _context;

    public ProcesoContableService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<ProcesoContable> Set => _context.ProcesosContables;

    protected override IQueryable<ProcesoContable> BuildReadQuery()
    {
        return _context.ProcesosContables.AsNoTracking();
    }

    protected override Expression<Func<ProcesoContable, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdProcesoContable == id;
    }

    protected override void UpdateEntity(ProcesoContable existingEntity, ProcesoContable incomingEntity)
    {
        existingEntity.PeriodoAnho = incomingEntity.PeriodoAnho;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.CantNiveles = incomingEntity.CantNiveles;
        existingEntity.CantDigitosNivel = incomingEntity.CantDigitosNivel;
        existingEntity.Moneda = incomingEntity.Moneda;
        existingEntity.Estado = incomingEntity.Estado;
        existingEntity.CreatedAt = incomingEntity.CreatedAt;
    }
}
