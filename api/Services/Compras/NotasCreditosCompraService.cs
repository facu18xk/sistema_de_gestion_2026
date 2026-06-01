using System;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Dtos.Contabilidad; 
using api.Dtos.AsientosDetalles; 
using api.Dtos.Asientos; 

namespace api.Services;

public class NotasCreditosCompraService : CrudServiceBase<NotasCreditosCompra, int>
{
    private readonly DblosAmigosContext _context;
    private readonly IAsientoContableService _asientoContableService;

    public NotasCreditosCompraService(
        DblosAmigosContext context,
        IAsientoContableService asientoContableService)
        : base(context)
    {
        _context = context;
        _asientoContableService = asientoContableService;
    }

    protected override DbSet<NotasCreditosCompra> Set => _context.NotasCreditosCompras;

    protected override IQueryable<NotasCreditosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasCreditosCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasCreditosCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaCreditoCompra == id;
    }

    protected override void UpdateEntity(NotasCreditosCompra existingEntity, NotasCreditosCompra incomingEntity)
    {
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.IdNotaDevolucionCompra = incomingEntity.IdNotaDevolucionCompra;
        existingEntity.Timbrado = incomingEntity.Timbrado;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Total = incomingEntity.Total;
    }

    public override async Task<NotasCreditosCompra> CreateAsync(NotasCreditosCompra entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevaNota = await base.CreateAsync(entity);

            decimal totalBruto = nuevaNota.Total;
            decimal totalIva = Math.Round(totalBruto / 11m, 2);
            decimal totalNeto = totalBruto - totalIva;

            if (totalBruto > 0)
            {
                var asientoDto = new AsientoCompletoUpsertDto
                {
                    IdModulo = 1, // Módulo de Compras
                    Fecha = DateOnly.FromDateTime(nuevaNota.FechaEmision),
                    Descripcion = string.IsNullOrWhiteSpace(nuevaNota.Motivo) 
                        ? "Registro de Nota de Crédito Compra" 
                        : $"N.C. Compra - Motivo: {nuevaNota.Motivo}",
                    Automatico = true,
                    Estado = "Registrado",
                    ReferenciaOrigen = "Notas_Creditos_Compras",
                    IdOrigen = nuevaNota.IdNotaCreditoCompra,
                    
                    Detalles = new List<AsientosDetalleUpsertDto>
                    {
                        // DEBE: Proveedores 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 11, 
                            Item = 1,
                            TipoMovimiento = "D", 
                            Monto = totalBruto,
                            DescripcionItem = "Reversión de obligación s/ Nota de Crédito"
                        },
                        // HABER: Mercaderías 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 9, 
                            Item = 2,
                            TipoMovimiento = "H", 
                            Monto = totalNeto,
                            DescripcionItem = "Ajuste de mercadería s/ Nota de Crédito"
                        },
                        // HABER: IVA Crédito Fiscal 
                        new AsientosDetalleUpsertDto
                        {
                            IdCuentaContable = 10, 
                            Item = 3,
                            TipoMovimiento = "H", 
                            Monto = totalIva,
                            DescripcionItem = "Reversión IVA Crédito Fiscal"
                        }
                    }
                };

                await _asientoContableService.CreateManualAsync(asientoDto);
            }

            await transaction.CommitAsync();

            return nuevaNota;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private IQueryable<NotasCreditosCompra> BuildQuery()
    {
        return _context.NotasCreditosCompras
            .Include(n => n.IdFacturaCompraNavigation)
            .Include(n => n.IdNotaDevolucionCompraNavigation)
            .Include(n => n.NotasCreditosComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}