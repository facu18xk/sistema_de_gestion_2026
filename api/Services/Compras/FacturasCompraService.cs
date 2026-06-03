using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace api.Services;

public class FacturasCompraService : CrudServiceBase<FacturasCompra, int>
{
    private readonly DblosAmigosContext _context;

    public FacturasCompraService(DblosAmigosContext context) 
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<FacturasCompra> Set => _context.FacturasCompras;

    protected override IQueryable<FacturasCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<FacturasCompra> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<FacturasCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdFacturaCompra == id;
    }

    protected override void UpdateEntity(FacturasCompra existingEntity, FacturasCompra incomingEntity)
    {
        existingEntity.IdOrdenCompra = incomingEntity.IdOrdenCompra;
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado; 
        existingEntity.NroComprobante = incomingEntity.NroComprobante;
        existingEntity.Timbrado = incomingEntity.Timbrado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    public override async Task<FacturasCompra> CreateAsync(FacturasCompra entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevaFactura = await base.CreateAsync(entity);
            if (entity.FacturasComprasDetalles != null && entity.FacturasComprasDetalles.Any())
            {
                foreach (var detalle in entity.FacturasComprasDetalles)
                {
                    var stockActual = await _context.StocksDepositos
                        .FirstOrDefaultAsync(s => s.IdProducto == detalle.IdProducto && s.IdDeposito == 1);

                    if (stockActual != null)
                    {
                        stockActual.Cantidad += detalle.Cantidad;
                        _context.StocksDepositos.Update(stockActual);
                    }
                    else
                    {
                        var nuevoStock = new StocksDeposito
                        {
                            IdDeposito = 1,
                            IdProducto = detalle.IdProducto,
                            Cantidad = detalle.Cantidad
                        };
                        await _context.StocksDepositos.AddAsync(nuevoStock);
                    }
                }
                
                await _context.SaveChangesAsync();
            }
            await transaction.CommitAsync();
            return nuevaFactura;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw; 
        }
    }

    private IQueryable<FacturasCompra> BuildQuery()
    {
        return _context.FacturasCompras
            .Include(f => f.IdEstadoNavigation) 
            .Include(f => f.IdProveedorNavigation)
            .Include(f => f.FacturasComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}