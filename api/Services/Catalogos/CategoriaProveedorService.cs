using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CategoriaProveedorService : CompositeCrudServiceBase<CategoriaProveedor, int, int>
{
    private readonly DblosAmigosContext _context;

    public CategoriaProveedorService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<CategoriaProveedor> Set => _context.CategoriasProveedores;

    protected override IQueryable<CategoriaProveedor> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    public override async Task<CategoriaProveedor?> GetByIdAsync(int proveedorId, int categoriaId)
    {
        return await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.ProveedorId == proveedorId && entity.CategoriaId == categoriaId);
    }

    protected override void UpdateEntity(CategoriaProveedor existingEntity, CategoriaProveedor incomingEntity)
    {
    }

    private IQueryable<CategoriaProveedor> BuildQuery()
    {
        return _context.CategoriasProveedores
            .Include(entity => entity.Categoria)
            .Include(entity => entity.Proveedor);
    }
}
