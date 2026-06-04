using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ProductoService : CrudServiceBase<Producto, int>
{
    private readonly DblosAmigosContext _context;

    public ProductoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Producto> Set => _context.Productos;

    protected override IQueryable<Producto> BuildReadQuery()
    {
        return _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.IdMarcaNavigation)
            .Include(p => p.StocksDepositos)
            .AsNoTracking();
    }

    protected override IQueryable<Producto> BuildGetByIdQuery()
    {
        return _context.Productos
            .Include(p => p.IdCategoriaNavigation)
            .Include(p => p.IdMarcaNavigation)
            .Include(p => p.StocksDepositos)
            .AsNoTracking();
    }

    protected override Expression<Func<Producto, bool>> BuildKeyPredicate(int id)
    {
        return producto => producto.IdProducto == id;
    }

    protected override void UpdateEntity(Producto existingEntity, Producto incomingEntity)
    {
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.IdMarca = incomingEntity.IdMarca;
        existingEntity.IdCategoria = incomingEntity.IdCategoria;
        existingEntity.EsServicio = incomingEntity.EsServicio;
        existingEntity.PorcentajeIva = incomingEntity.PorcentajeIva;
    }
}
