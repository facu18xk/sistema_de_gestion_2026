using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public abstract class CrudServiceBase<TEntity, TId> : ICrudService<TEntity, TId>
    where TEntity : class
{
    protected readonly DbContext Context;

    protected CrudServiceBase(DbContext context)
    {
        Context = context;
    }

    protected abstract DbSet<TEntity> Set { get; }

    protected virtual IQueryable<TEntity> BuildReadQuery()
    {
        return Set;
    }

    protected virtual IQueryable<TEntity> BuildGetByIdQuery()
    {
        return Set;
    }

    protected abstract void UpdateEntity(TEntity existingEntity, TEntity incomingEntity);

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        return await BuildReadQuery().ToListAsync();
    }

    public virtual async Task<TEntity?> GetByIdAsync(TId id)
    {
        return await BuildGetByIdQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
    }

    public virtual async Task<TEntity> CreateAsync(TEntity entity)
    {
        Set.Add(entity);
        await Context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity> UpdateAsync(TId id, TEntity entity)
    {
        var existingEntity = await Set.FindAsync(id);

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await Context.SaveChangesAsync();
        return existingEntity;
    }

    public virtual async Task DeleteAsync(TId id)
    {
        var entity = await Set.FindAsync(id);
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await Context.SaveChangesAsync();
    }

    protected abstract Expression<Func<TEntity, bool>> BuildKeyPredicate(TId id);
}
