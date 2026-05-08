using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ModeloAsientoService : CrudServiceBase<ModeloAsiento, int>
{
    private readonly DblosAmigosContext _context;

    public ModeloAsientoService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<ModeloAsiento> Set => _context.ModelosAsientos;

    protected override IQueryable<ModeloAsiento> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<ModeloAsiento> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<ModeloAsiento, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdModeloAsiento == id;
    }

    protected override void UpdateEntity(ModeloAsiento existingEntity, ModeloAsiento incomingEntity)
    {
        existingEntity.IdModulo = incomingEntity.IdModulo;
        existingEntity.TipoAsiento = incomingEntity.TipoAsiento;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.DetalleResumen = incomingEntity.DetalleResumen;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private IQueryable<ModeloAsiento> BuildQuery()
    {
        return _context.ModelosAsientos
            .Include(modelo => modelo.IdModuloNavigation);
    }
}
