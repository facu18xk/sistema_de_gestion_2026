using api.Dtos.Common;

namespace api.Services;

public interface ICrudService<T, TId>
{
    Task<PagedResultDto<T>> GetAllAsync(PaginationQueryDto pagination);
    Task<T?> GetByIdAsync(TId id);
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(TId id, T entity);
    Task DeleteAsync(TId id);
}
