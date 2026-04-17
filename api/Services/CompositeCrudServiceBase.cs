using Microsoft.EntityFrameworkCore;

namespace api.Services;

public abstract class CompositeCrudServiceBase<TEntity, TKey1, TKey2> : ICompositeCrudService<TEntity, TKey1, TKey2>
    where TEntity : class
{
    protected readonly DbContext Context;

    protected CompositeCrudServiceBase(DbContext context)
    {
        Context = context;
    }

    protected abstract DbSet<TEntity> Set { get; }

    protected abstract void UpdateEntity(TEntity existingEntity, TEntity incomingEntity);

    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        return await Set.AsNoTracking().ToListAsync();
    }

    public virtual async Task<TEntity?> GetByIdAsync(TKey1 key1, TKey2 key2)
    {
        return await Set.FindAsync(key1!, key2!);
    }

    public virtual async Task<TEntity> CreateAsync(TEntity entity)
    {
        Set.Add(entity);
        await Context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity> UpdateAsync(TKey1 key1, TKey2 key2, TEntity entity)
    {
        var existingEntity = await Set.FindAsync(key1!, key2!);

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro con PK compuesta ({key1}, {key2})");
        }

        UpdateEntity(existingEntity, entity);
        await Context.SaveChangesAsync();
        return existingEntity;
    }

    public virtual async Task DeleteAsync(TKey1 key1, TKey2 key2)
    {
        var entity = await Set.FindAsync(key1!, key2!);
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await Context.SaveChangesAsync();
    }
}
