using DatabaseHastaCompraVenta.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class MarcaService : ICrudService<Marca, int>
{
    private readonly DblosAmigosContext _context;

    public MarcaService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Marca>> GetAllAsync()
    {
        return await _context.Marcas
            .OrderBy(m => m.Nombre)
            .ToListAsync();
    }

    public async Task<Marca?> GetByIdAsync(int id)
    {
        return await _context.Marcas.FindAsync(id);
    }

    public async Task<Marca> CreateAsync(Marca entity)
    {
        _context.Marcas.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Marca> UpdateAsync(int id, Marca entity)
    {
        var existe = await _context.Marcas.FindAsync(id);

        if (existe is null)
        {
            throw new KeyNotFoundException($"No existe la marca con ID {id}");
        }

        existe.Nombre = entity.Nombre;

        _context.Marcas.Update(existe);
        await _context.SaveChangesAsync();
        return existe;
    }

    public async Task DeleteAsync(int id)
    {
        var marca = await _context.Marcas.FindAsync(id);
        if (marca is null)
        {
            return;
        }

        _context.Marcas.Remove(marca);
        await _context.SaveChangesAsync();
    }
}
