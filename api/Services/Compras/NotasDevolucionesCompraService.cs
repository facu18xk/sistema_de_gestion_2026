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

    public override async Task DeleteAsync(int id)
    {
        var entity = await _context.NotasDevolucionesCompras
            .Include(n => n.NotasDevolucionesComprasDetalles)
            .FirstOrDefaultAsync(n => n.IdNotaDevolucionCompra == id);

        if (entity is null)
        {
            return;
        }

        if (entity.NotasDevolucionesComprasDetalles != null && entity.NotasDevolucionesComprasDetalles.Any())
        {
            _context.RemoveRange(entity.NotasDevolucionesComprasDetalles);
        }

        _context.NotasDevolucionesCompras.Remove(entity);
        await _context.SaveChangesAsync();
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

            // No procesar si ya está en ese estado
            if (nota.IdEstadoNavigation?.Nombre?.ToLower() == nuevoEstadoStr.ToLower())
                return nota;

            var nuevoEstado = await _context.Estados.FirstOrDefaultAsync(e => e.Nombre.ToLower() == nuevoEstadoStr.ToLower());
            if (nuevoEstado == null) throw new Exception("Estado no válido");

            // Si pasa a Aprobado
            if (nuevoEstadoStr.Equals("Aprobado", StringComparison.OrdinalIgnoreCase))
            {
                // 1. Descontar stock (IdDeposito = 1 asumido por defecto como en FacturasCompra)
                if (nota.NotasDevolucionesComprasDetalles != null)
                {
                    foreach (var detalle in nota.NotasDevolucionesComprasDetalles)
                    {
                        var stock = await _context.StocksDepositos
                            .FirstOrDefaultAsync(s => s.IdProducto == detalle.IdProducto && s.IdDeposito == 1);

                        if (stock != null)
                        {
                            stock.Cantidad -= detalle.Cantidad;
                            // Prevenir stock negativo si se requiere, aunque a veces se permite
                            if (stock.Cantidad < 0) stock.Cantidad = 0; 
                            _context.StocksDepositos.Update(stock);
                        }
                    }
                }

                // 2. Aumentar monto en cuenta bancaria enlazada a la factura
                var ordenPagoDetalle = await _context.OrdenesPagosComprasDetalles
                    .FirstOrDefaultAsync(d => d.IdFacturaCompra == nota.IdFacturaCompra);

                int idCuentaBancaria = ordenPagoDetalle?.IdCuentaBancaria ?? 1; // Fallback a 1 si no hay orden de pago

                var cuenta = await _context.CuentasBancarias.FirstOrDefaultAsync(c => c.IdCuentaBancaria == idCuentaBancaria);
                decimal montoTotal = nota.NotasDevolucionesComprasDetalles?.Sum(d => d.Subtotal) ?? 0;

                if (cuenta != null)
                {
                    cuenta.Saldo += montoTotal;
                    cuenta.SaldoDisponible += montoTotal;
                    _context.CuentasBancarias.Update(cuenta);
                }

                // 3. Crear Nota de Crédito
                var notaCredito = new NotasCreditosCompra
                {
                    IdFacturaCompra = nota.IdFacturaCompra,
                    IdNotaDevolucionCompra = nota.IdNotaDevolucionCompra,
                    Timbrado = nota.IdFacturaCompraNavigation?.Timbrado ?? "00000000",
                    Motivo = nota.Motivo,
                    FechaEmision = DateTime.UtcNow,
                    Total = montoTotal,
                    NotasCreditosComprasDetalles = nota.NotasDevolucionesComprasDetalles?.Select(d => new NotasCreditosComprasDetalle
                    {
                        IdProducto = d.IdProducto,
                        Cantidad = d.Cantidad,
                        PrecioUnitario = d.PrecioUnitario,
                        Subtotal = d.Subtotal
                    }).ToList() ?? new List<NotasCreditosComprasDetalle>()
                };
                
                _context.NotasCreditosCompras.Add(notaCredito);
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