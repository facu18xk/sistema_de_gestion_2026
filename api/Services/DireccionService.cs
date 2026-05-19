using System.Collections.Generic;
using System.Threading.Tasks;
using api.Dtos.Common;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Services;

namespace api.Services
{
    public class DireccionService : ICrudService<Direccion, int>
    {
        private readonly DblosAmigosContext _context;

        public DireccionService(DblosAmigosContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<Direccion>> GetAllAsync(PaginationQueryDto pagination)
        {
            var page = pagination.GetNormalizedPage();
            var pageSize = pagination.GetNormalizedPageSize();
            var query = _context.Direcciones
                .Include(d => d.IdCiudadNavigation)
                .AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResultDto<Direccion>
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

        public async Task<Direccion?> GetByIdAsync(int id)
        {
            return await _context.Direcciones
                .Include(d => d.IdCiudadNavigation)
                .FirstOrDefaultAsync(d => d.IdDireccion == id);
        }

        public async Task<Direccion> CreateAsync(Direccion entity)
        {
            _context.Direcciones.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Direccion> UpdateAsync(int id, Direccion entity)
        {
            var existe = await _context.Direcciones.FindAsync(id);

            if (existe == null)
                throw new KeyNotFoundException($"No existe la dirección con ID {id}");

            existe.Calle1 = entity.Calle1;
            existe.Calle2 = entity.Calle2;
            existe.Descripcion = entity.Descripcion;
            existe.IdCiudad = entity.IdCiudad;

            _context.Direcciones.Update(existe);
            await _context.SaveChangesAsync();
            return existe;
        }

        public async Task DeleteAsync(int id)
        {
            var direccion = await _context.Direcciones.FindAsync(id);
            if (direccion != null)
            {
                _context.Direcciones.Remove(direccion);
                await _context.SaveChangesAsync();
            }
        }
    }
}
