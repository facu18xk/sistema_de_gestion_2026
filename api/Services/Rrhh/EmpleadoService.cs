using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EmpleadoService : CrudServiceBase<Empleado, int>
{
    private readonly DblosAmigosContext _context;

    public EmpleadoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Empleado> Set => _context.Empleados;

    protected override IQueryable<Empleado> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Empleado> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Empleado, bool>> BuildKeyPredicate(int id)
    {
        return e => e.IdEmpleado == id;
    }

    protected override void UpdateEntity(Empleado existingEntity, Empleado incomingEntity)
    {
        existingEntity.Ci = incomingEntity.Ci;
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.FechaIngreso = incomingEntity.FechaIngreso;

        if (incomingEntity.IdPersonaNavigation is not null)
        {
            existingEntity.IdPersonaNavigation ??= incomingEntity.IdPersonaNavigation;
            existingEntity.IdPersonaNavigation.Nombres = incomingEntity.IdPersonaNavigation.Nombres;
            existingEntity.IdPersonaNavigation.Apellidos = incomingEntity.IdPersonaNavigation.Apellidos;
            existingEntity.IdPersonaNavigation.Correo = incomingEntity.IdPersonaNavigation.Correo;
            existingEntity.IdPersonaNavigation.Telefono = incomingEntity.IdPersonaNavigation.Telefono;

            if (incomingEntity.IdPersonaNavigation.IdDireccionNavigation is not null)
            {
                existingEntity.IdPersonaNavigation.IdDireccionNavigation ??=
                    incomingEntity.IdPersonaNavigation.IdDireccionNavigation;

                existingEntity.IdPersonaNavigation.IdDireccionNavigation.Calle1 =
                    incomingEntity.IdPersonaNavigation.IdDireccionNavigation.Calle1;
                existingEntity.IdPersonaNavigation.IdDireccionNavigation.Calle2 =
                    incomingEntity.IdPersonaNavigation.IdDireccionNavigation.Calle2;
                existingEntity.IdPersonaNavigation.IdDireccionNavigation.Descripcion =
                    incomingEntity.IdPersonaNavigation.IdDireccionNavigation.Descripcion;
                existingEntity.IdPersonaNavigation.IdDireccionNavigation.IdCiudad =
                    incomingEntity.IdPersonaNavigation.IdDireccionNavigation.IdCiudad;
                
                existingEntity.IdPersonaNavigation.IdDireccion =
                    existingEntity.IdPersonaNavigation.IdDireccionNavigation.IdDireccion;
            }
            else
            {
                existingEntity.IdPersonaNavigation.IdDireccion = incomingEntity.IdPersonaNavigation.IdDireccion;
            }
        }
    }

    public override async Task<Empleado> UpdateAsync(int id, Empleado entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el empleado con ID {id}");
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
        
        if (entity.IdPersonaNavigation is not null)
        {
            _context.Personas.Remove(entity.IdPersonaNavigation);
        }

        await _context.SaveChangesAsync();
    }

    private IQueryable<Empleado> BuildQuery()
    {

        return _context.Empleados
            .Include(e => e.IdPersonaNavigation)
                .ThenInclude(p => p.IdDireccionNavigation)
                    .ThenInclude(d => d.IdCiudadNavigation)
                        .ThenInclude(ciudad => ciudad.IdPaisNavigation);
    }
}