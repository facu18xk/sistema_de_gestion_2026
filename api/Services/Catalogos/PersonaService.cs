using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PersonaService : CrudServiceBase<Persona, int>
{
    private readonly DblosAmigosContext _context;

    public PersonaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Persona> Set => _context.Personas;

    protected override IQueryable<Persona> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Persona> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Persona, bool>> BuildKeyPredicate(int id)
    {
        return persona => persona.IdPersona == id;
    }

    protected override void UpdateEntity(Persona existingEntity, Persona incomingEntity)
    {
        existingEntity.IdDireccion = incomingEntity.IdDireccion;
        existingEntity.Nombres = incomingEntity.Nombres;
        existingEntity.Apellidos = incomingEntity.Apellidos;
        existingEntity.Correo = incomingEntity.Correo;
        existingEntity.Telefono = incomingEntity.Telefono;
    }

    public override async Task<Persona> UpdateAsync(int id, Persona entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe la persona con ID {id}");
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

    private IQueryable<Persona> BuildQuery()
    {

        return _context.Personas
            .Include(p => p.IdDireccionNavigation);
    }
}