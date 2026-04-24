using api.Dtos.Common;

namespace api.Services;

public interface ICompositeCrudService<TEntity, TKey1, TKey2>
{
    Task<PagedResultDto<TEntity>> GetAllAsync(PaginationQueryDto pagination);
    Task<TEntity?> GetByIdAsync(TKey1 key1, TKey2 key2);
    Task<TEntity> CreateAsync(TEntity entity);
    Task<TEntity> UpdateAsync(TKey1 key1, TKey2 key2, TEntity entity);
    Task DeleteAsync(TKey1 key1, TKey2 key2);
}
