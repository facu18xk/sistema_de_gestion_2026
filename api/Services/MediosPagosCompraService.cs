using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class MediosPagosCompraService : CrudServiceBase<MediosPagosCompra, int>
{
    private readonly DblosAmigosContext _context;

    public MediosPagosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<MediosPagosCompra> Set => _context.MediosPagosCompras;

    protected override IQueryable<MediosPagosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<MediosPagosCompra> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<MediosPagosCompra, bool>> BuildKeyPredicate(int id)
    {
        return medio => medio.IdMedioPagoCompra == id;
    }

    protected override void UpdateEntity(MediosPagosCompra existingEntity, MediosPagosCompra incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }

    public override async Task<MediosPagosCompra> UpdateAsync(int id, MediosPagosCompra entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el medio de pago con ID {id}");
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

    private IQueryable<MediosPagosCompra> BuildQuery()
    {
        return _context.MediosPagosCompras;
    }
}