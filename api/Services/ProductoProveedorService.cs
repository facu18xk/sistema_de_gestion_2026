using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ProductoProveedorService : CompositeCrudServiceBase<ProductoProveedor, int, int>
{
    private readonly DblosAmigosContext _context;

    public ProductoProveedorService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<ProductoProveedor> Set => _context.ProductosProveedores;

    protected override IQueryable<ProductoProveedor> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    public override async Task<ProductoProveedor?> GetByIdAsync(int productoId, int proveedorId)
    {
        return await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.ProductoId == productoId && entity.ProveedorId == proveedorId);
    }

    protected override void UpdateEntity(ProductoProveedor existingEntity, ProductoProveedor incomingEntity)
    {
        existingEntity.CodigoProveedor = incomingEntity.CodigoProveedor;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private IQueryable<ProductoProveedor> BuildQuery()
    {
        return _context.ProductosProveedores
            .Include(entity => entity.Producto)
            .Include(entity => entity.Proveedor);
    }
}
