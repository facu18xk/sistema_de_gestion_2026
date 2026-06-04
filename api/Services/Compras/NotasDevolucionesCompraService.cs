using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasDevolucionesCompraService : CrudServiceBase<NotasDevolucionesCompra, int>
{
    private readonly DblosAmigosContext _context;

    public NotasDevolucionesCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasDevolucionesCompra> Set => _context.NotasDevolucionesCompras;

    protected override IQueryable<NotasDevolucionesCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasDevolucionesCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasDevolucionesCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaDevolucionCompra == id;
    }

    protected override void UpdateEntity(NotasDevolucionesCompra existingEntity, NotasDevolucionesCompra incomingEntity)
    {
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    public async Task<NotasDevolucionesCompra> CambiarEstadoAsync(int id, string nuevoEstadoStr)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var nota = await _context.NotasDevolucionesCompras
                .Include(n => n.IdEstadoNavigation)
                .Include(n => n.NotasDevolucionesComprasDetalles)
                .FirstOrDefaultAsync(n => n.IdNotaDevolucionCompra == id);

            if (nota == null) throw new Exception("Nota de devolución no encontrada");

            if (nota.IdEstadoNavigation?.Nombre?.ToLower() == nuevoEstadoStr.ToLower())
                return nota;

            var nuevoEstado = await _context.Estados.FirstOrDefaultAsync(e => e.Nombre.ToLower() == nuevoEstadoStr.ToLower());
            if (nuevoEstado == null) throw new Exception("Estado no válido");

            if (nuevoEstadoStr.Equals("Aprobado", StringComparison.OrdinalIgnoreCase))
            {
                if (nota.NotasDevolucionesComprasDetalles != null)
                {
                    foreach (var detalle in nota.NotasDevolucionesComprasDetalles)
                    {
                        var stock = await _context.StocksDepositos
                            .FirstOrDefaultAsync(s => s.IdProducto == detalle.IdProducto && s.IdDeposito == 1);

                        if (stock != null)
                        {
                            stock.Cantidad -= detalle.Cantidad;
                            if (stock.Cantidad < 0) stock.Cantidad = 0; 
                            _context.StocksDepositos.Update(stock);
                        }
                    }
                }

                var ordenPagoDetalle = await _context.OrdenesPagosComprasDetalles
                    .FirstOrDefaultAsync(d => d.IdFacturaCompra == nota.IdFacturaCompra);

                int idCuentaBancaria = ordenPagoDetalle?.IdCuentaBancaria ?? 1; 

                var cuenta = await _context.CuentasBancarias.FirstOrDefaultAsync(c => c.IdCuentaBancaria == idCuentaBancaria);
                if (cuenta != null)
                {
                    decimal montoTotal = nota.NotasDevolucionesComprasDetalles?.Sum(d => d.Subtotal) ?? 0;
                    cuenta.Saldo += montoTotal;
                    cuenta.SaldoDisponible += montoTotal;
                    _context.CuentasBancarias.Update(cuenta);
                }
            }

            nota.IdEstado = nuevoEstado.IdEstado;
            _context.NotasDevolucionesCompras.Update(nota);
            
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return nota;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private IQueryable<NotasDevolucionesCompra> BuildQuery()
    {
        return _context.NotasDevolucionesCompras
            .Include(n => n.IdFacturaCompraNavigation)
            .Include(n => n.IdEstadoNavigation)
            .Include(n => n.NotasDevolucionesComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}