using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DatabaseHastaCompraVenta.Models; 
using api.Services;

namespace api.Services
{
    public class ProductoService : ICrudService<Producto, int>
    {
        private readonly DblosAmigosContext _context;

        public ProductoService(DblosAmigosContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Producto>> GetAllAsync()
        {
            return await _context.Productos
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdMarcaNavigation)
                .ToListAsync();
        }

        public async Task<Producto?> GetByIdAsync(int id)
        {
            return await _context.Productos
                .Include(p => p.IdCategoriaNavigation)
                .Include(p => p.IdMarcaNavigation)
                .FirstOrDefaultAsync(p => p.IdProducto == id);
        }

        public async Task<Producto> CreateAsync(Producto entity)
        {
            _context.Productos.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<Producto> UpdateAsync(int id, Producto entity)
        {
            var existe = await _context.Productos.FindAsync(id);

            if (existe == null)
                throw new KeyNotFoundException($"No existe el producto con ID {id}");

            existe.Descripcion = entity.Descripcion;
            existe.PrecioUnitario = entity.PrecioUnitario;
            existe.IdMarca = entity.IdMarca;
            existe.IdCategoria = entity.IdCategoria;
            existe.EsServicio = entity.EsServicio;
            existe.PorcentajeIva = entity.PorcentajeIva;

            _context.Productos.Update(existe);
            await _context.SaveChangesAsync();
            return existe;
        }

        public async Task DeleteAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto != null)
            {
                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();
            }
        }
    }
}