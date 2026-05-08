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
        existingEntity.IdPersona = incomingEntity.IdPersona;
        existingEntity.Ci = incomingEntity.Ci;
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.FechaNacimiento = incomingEntity.FechaNacimiento;
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
        await _context.SaveChangesAsync();
    }

    private IQueryable<Cliente> BuildQuery()
    {
        return _context.Clientes
            .Include(c => c.IdPersonaNavigation);
    }
}