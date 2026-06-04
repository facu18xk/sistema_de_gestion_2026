using System.Collections.Generic;
using System.Threading.Tasks;
using api.Dtos.Common;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Services;

namespace api.Services
{
    public class CiudadService : ICrudService<Ciudad, int>
    {
        private readonly DblosAmigosContext _context;

        public CiudadService(DblosAmigosContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<Ciudad>> GetAllAsync(PaginationQueryDto pagination)
        {
            var page = pagination.GetNormalizedPage();
            var pageSize = pagination.GetNormalizedPageSize();
            var query = _context.Ciudades
                .Include(c => c.IdPaisNavigation)
                .AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PagedResultDto<Ciudad>
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

        public async Task<Ciudad?> GetByIdAsync(int id)
        {
            return await _context.Ciudades
                .Include(c => c.IdPaisNavigation)
                .FirstOrDefaultAsync(c => c.IdCiudad == id);
        }

        public async Task<IEnumerable<Ciudad>> GetByPaisAsync(int idPais)
        {
            return await _context.Ciudades
                .Where(c => c.IdPais == idPais)
                .Include(c => c.IdPaisNavigation)
                .ToListAsync();
        }

        public async Task<Ciudad> CreateAsync(Ciudad entity)
        {
            _context.Ciudades.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Ciudad> UpdateAsync(int id, Ciudad entity)
        {
            var existe = await _context.Ciudades.FindAsync(id);

            if (existe == null)
                throw new KeyNotFoundException($"No existe la ciudad con ID {id}");

            existe.Nombre = entity.Nombre;
            existe.IdPais = entity.IdPais;

            _context.Ciudades.Update(existe);
            await _context.SaveChangesAsync();
            return existe;
        }

        public async Task DeleteAsync(int id)
        {
            var ciudad = await _context.Ciudades.FindAsync(id);
            if (ciudad != null)
            {
                _context.Ciudades.Remove(ciudad);
                await _context.SaveChangesAsync();
            }
        }
    }
}
