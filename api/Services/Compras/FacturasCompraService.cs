using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;
using api.Dtos.Contabilidad; 
using api.Dtos.AsientosDetalles; 
using api.Dtos.Asientos; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.Services;
// para usar asiento y hacer post hay que enviar detalle y cabecera al mismo tiempo JSON 
public class FacturasCompraService : CrudServiceBase<FacturasCompra, int>
{
    private readonly DblosAmigosContext _context;
    
    private readonly IAsientoContableService _asientoContableService;

    public FacturasCompraService(
        DblosAmigosContext context, 
        IAsientoContableService asientoContableService) 
        : base(context)
    {
        _context = context;
        _asientoContableService = asientoContableService;
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

            decimal totalNeto = entity.FacturasComprasDetalles?.Sum(d => d.TotalNeto) ?? 0;
            decimal totalIva = entity.FacturasComprasDetalles?.Sum(d => d.TotalIva) ?? 0;
            decimal totalBruto = entity.FacturasComprasDetalles?.Sum(d => d.TotalBruto) ?? 0;

            if (totalBruto > 0)
            {
                var asientoDto = new AsientoCompletoUpsertDto
                {
                    IdModulo = 1, 
                    Fecha = DateOnly.FromDateTime(nuevaFactura.Fecha),
                    Descripcion = string.IsNullOrWhiteSpace(nuevaFactura.Descripcion) 
                        ? $"Registro de Factura de Compra Nro: {nuevaFactura.NroComprobante}" 
                        : nuevaFactura.Descripcion,
                    Automatico = true,
                    Estado = "Registrado",
                    ReferenciaOrigen = "Facturas_Compras",
                    IdOrigen = nuevaFactura.IdFacturaCompra,
                    
                    Detalles = new List<AsientosDetalleUpsertDto>
                    {
                        // debe mercaderias 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 9, 
                            Item = 1,
                            TipoMovimiento = "D", 
                            Monto = totalNeto,
                            DescripcionItem = "Ingreso de mercadería s/ Factura"
                        },
                        // debe iva credito fiscal 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 10, 
                            Item = 2,
                            TipoMovimiento = "D", 
                            Monto = totalIva,
                            DescripcionItem = "IVA Crédito Fiscal"
                        },
                        // haber proveedores 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 11, 
                            Item = 3,
                            TipoMovimiento = "H", 
                            Monto = totalBruto,
                            DescripcionItem = $"Obligación con proveedor s/ Comprobante {nuevaFactura.NroComprobante}"
                        }
                    }
                };

                await _asientoContableService.CreateManualAsync(asientoDto);
            }

            //si sale bien guardamos 
            await transaction.CommitAsync();

            return nuevaFactura;
        }
        catch (Exception)
        {
            //si hay error revertir 
            await transaction.RollbackAsync();
            throw; 
        }
    }

    private IQueryable<FacturasCompra> BuildQuery()
    {
        return _context.FacturasCompras
            .Include(f => f.IdProveedorNavigation)
            .Include(f => f.FacturasComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}