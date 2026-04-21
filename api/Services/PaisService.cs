using api.Dtos.Common;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class PaisService : ICrudService<Pais, int>
    {
        private readonly DblosAmigosContext _context;

        public PaisService(DblosAmigosContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<Pais>> GetAllAsync(PaginationQueryDto pagination)
        {
            var page = pagination.GetNormalizedPage();
            var pageSize = pagination.GetNormalizedPageSize();
            var query = _context.Paises.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResultDto<Pais>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasPreviousPage = page > 1 && totalPages > 0,
                HasNextPage = page < totalPages
            };
        }

        public async Task<Pais?> GetByIdAsync(int id)
        {
            return await _context.Paises.FindAsync(id);
        }

        public async Task<Pais> CreateAsync(Pais entity)
        {
            _context.Paises.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Pais> UpdateAsync(int id, Pais entity)
        {
            var existe = await _context.Paises.FindAsync(id);

            if (existe == null)
                throw new KeyNotFoundException($"No existe el país con ID {id}");

            existe.Nombre = entity.Nombre;

            _context.Paises.Update(existe);
            await _context.SaveChangesAsync();
            return existe;
        }

        public async Task DeleteAsync(int id)
        {
            var pais = await _context.Paises.FindAsync(id);
            if (pais != null)
            {
                _context.Paises.Remove(pais);
                await _context.SaveChangesAsync();
            }
        }
    }
}
