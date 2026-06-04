using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EstadoService : CrudServiceBase<Estado, int>
{
    private readonly DblosAmigosContext _context;

    public EstadoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Estado> Set => _context.Estados; // Asegúrate de que el DbSet en tu context se llame "Estados"

    protected override IQueryable<Estado> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Estado> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Estado, bool>> BuildKeyPredicate(int id)
    {
        return estado => estado.IdEstado == id;
    }

    protected override void UpdateEntity(Estado existingEntity, Estado incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }

    public override async Task<Estado> UpdateAsync(int id, Estado entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el estado con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return existingEntity;
    }

    public override async Task DeleteAsync(int id)
    {
        var entity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private IQueryable<Estado> BuildQuery()
    {
        return _context.Estados;
    }
}