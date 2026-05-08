using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ClienteService : CrudServiceBase<Cliente, int>
{
    private readonly DblosAmigosContext _context;

    public ClienteService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Cliente> Set => _context.Clientes;

    protected override IQueryable<Cliente> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Cliente> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Cliente, bool>> BuildKeyPredicate(int id)
    {
        return c => c.IdCliente == id;
    }

    protected override void UpdateEntity(Cliente existingEntity, Cliente incomingEntity)
    {
        existingEntity.Ci = incomingEntity.Ci;
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.FechaNacimiento = incomingEntity.FechaNacimiento;

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

    public override async Task<Cliente> UpdateAsync(int id, Cliente entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el cliente con ID {id}");
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

    private IQueryable<Cliente> BuildQuery()
    {
        return _context.Clientes
            .Include(c => c.IdPersonaNavigation)
                .ThenInclude(p => p.IdDireccionNavigation)
                    .ThenInclude(d => d.IdCiudadNavigation)
                        .ThenInclude(ciudad => ciudad.IdPaisNavigation);
    }
}