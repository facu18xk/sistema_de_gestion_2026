using DatabaseHastaCompraVenta.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CategoriaService : ICrudService<Categoria, int>
{
    private readonly DblosAmigosContext _context;

    public CategoriaService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Categoria>> GetAllAsync()
    {
        return await _context.Categorias
            .OrderBy(c => c.Nombre)
            .ToListAsync();
    }

    public async Task<Categoria?> GetByIdAsync(int id)
    {
        return await _context.Categorias.FindAsync(id);
    }

    public async Task<Categoria> CreateAsync(Categoria entity)
    {
        _context.Categorias.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Categoria> UpdateAsync(int id, Categoria entity)
    {
        var existe = await _context.Categorias.FindAsync(id);

        if (existe is null)
        {
            throw new KeyNotFoundException($"No existe la categoria con ID {id}");
        }

        existe.Nombre = entity.Nombre;

        _context.Categorias.Update(existe);
        await _context.SaveChangesAsync();
        return existe;
    }

    public async Task DeleteAsync(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria is null)
        {
            return;
        }

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();
    }
}
