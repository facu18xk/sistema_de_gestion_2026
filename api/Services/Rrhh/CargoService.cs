using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CargoService : CrudServiceBase<Cargo, int>
{
    private readonly DblosAmigosContext _context;

    public CargoService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<Cargo> Set => _context.Cargos;

    protected override IQueryable<Cargo> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Nombre);

    protected override Expression<Func<Cargo, bool>> BuildKeyPredicate(int id) => item => item.IdCargo == id;

    protected override void UpdateEntity(Cargo existingEntity, Cargo incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.Activo = incomingEntity.Activo;
    }
}
