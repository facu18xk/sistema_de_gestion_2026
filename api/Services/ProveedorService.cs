using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ProveedorService : CrudServiceBase<Proveedor, int>
{
    private readonly DblosAmigosContext _context;

    public ProveedorService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Proveedor> Set => _context.Proveedores;

    protected override IQueryable<Proveedor> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Proveedor> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Proveedor, bool>> BuildKeyPredicate(int id)
    {
        return proveedor => proveedor.IdProveedor == id;
    }

    protected override void UpdateEntity(Proveedor existingEntity, Proveedor incomingEntity)
    {
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.RazonSocial = incomingEntity.RazonSocial;
        existingEntity.NombreFantasia = incomingEntity.NombreFantasia;

        if (incomingEntity.IdProveedorNavigation is not null)
        {
            existingEntity.IdProveedorNavigation ??= incomingEntity.IdProveedorNavigation;
            existingEntity.IdProveedorNavigation.Nombres = incomingEntity.IdProveedorNavigation.Nombres;
            existingEntity.IdProveedorNavigation.Apellidos = incomingEntity.IdProveedorNavigation.Apellidos;
            existingEntity.IdProveedorNavigation.Correo = incomingEntity.IdProveedorNavigation.Correo;
            existingEntity.IdProveedorNavigation.Telefono = incomingEntity.IdProveedorNavigation.Telefono;

            if (incomingEntity.IdProveedorNavigation.IdDireccionNavigation is not null)
            {
                existingEntity.IdProveedorNavigation.IdDireccionNavigation ??=
                    incomingEntity.IdProveedorNavigation.IdDireccionNavigation;

                existingEntity.IdProveedorNavigation.IdDireccionNavigation.Calle1 =
                    incomingEntity.IdProveedorNavigation.IdDireccionNavigation.Calle1;
                existingEntity.IdProveedorNavigation.IdDireccionNavigation.Calle2 =
                    incomingEntity.IdProveedorNavigation.IdDireccionNavigation.Calle2;
                existingEntity.IdProveedorNavigation.IdDireccionNavigation.Descripcion =
                    incomingEntity.IdProveedorNavigation.IdDireccionNavigation.Descripcion;
                existingEntity.IdProveedorNavigation.IdDireccionNavigation.IdCiudad =
                    incomingEntity.IdProveedorNavigation.IdDireccionNavigation.IdCiudad;
                existingEntity.IdProveedorNavigation.IdDireccion =
                    existingEntity.IdProveedorNavigation.IdDireccionNavigation.IdDireccion;
            }
            else
            {
                existingEntity.IdProveedorNavigation.IdDireccion = incomingEntity.IdProveedorNavigation.IdDireccion;
            }
        }
    }

    public override async Task<Proveedor> UpdateAsync(int id, Proveedor entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {id}");
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
        if (entity.IdProveedorNavigation is not null)
        {
            _context.Personas.Remove(entity.IdProveedorNavigation);
        }

        await _context.SaveChangesAsync();
    }

    private IQueryable<Proveedor> BuildQuery()
    {
        return _context.Proveedores
            .Include(proveedor => proveedor.IdProveedorNavigation)
                .ThenInclude(persona => persona.IdDireccionNavigation)
                    .ThenInclude(direccion => direccion.IdCiudadNavigation)
                        .ThenInclude(ciudad => ciudad.IdPaisNavigation);
    }
}
