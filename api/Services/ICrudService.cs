using System.Collections.Generic;
using System.Threading.Tasks;

namespace api.Services
{
    public interface ICrudService<T, TId>
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(TId id);
        Task<T> CreateAsync(T entity);
        Task<T> UpdateAsync(TId id, T entity);
        Task DeleteAsync(TId id);
    }
}
