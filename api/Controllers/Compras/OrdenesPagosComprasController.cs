using api.Dtos.OrdenesPagosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesPagosComprasController : CrudControllerBase<OrdenesPagosCompra, OrdenesPagosCompraDto, OrdenesPagosCompraUpsertDto, int>
{
    public OrdenesPagosComprasController(ICrudService<OrdenesPagosCompra, int> ordenespagoscompraService)
        : base(ordenespagoscompraService)
    {
    }

   protected override OrdenesPagosCompraDto ToReadDto(OrdenesPagosCompra entity)
    {
        return new OrdenesPagosCompraDto
        {
            IdOrdenPagoCompra = entity.IdOrdenPagoCompra,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,
            
            Detalles = entity.OrdenesPagosComprasDetalles?
                .Select(d => new api.Dtos.OrdenesPagosComprasDetalles.OrdenesPagosComprasDetalleDto
                {
                    IdOrdenPagoCompraDetalle = d.IdOrdenPagoCompraDetalle,
                    IdOrdenPagoCompra = d.IdOrdenPagoCompra,
                    IdFacturaCompra = d.IdFacturaCompra,
                    IdCuentaBancaria = d.IdCuentaBancaria,
                    NumeroCuentaBancaria = d.IdCuentaBancariaNavigation?.NumeroCuenta ?? string.Empty,
                    IdMedioPagoCompra = d.IdMedioPagoCompra,
                    MedioPago = d.IdMedioPagoCompraNavigation?.Nombre ?? string.Empty,
                    Monto = d.Monto,
                    FacturaCompra = d.IdFacturaCompraNavigation is null 
                        ? null 
                        : new api.Dtos.OrdenesPagosComprasDetalles.FacturaCompraResumenDto 
                        {
                            IdFacturaCompra = d.IdFacturaCompraNavigation.IdFacturaCompra,
                            Nro_Comprobante = d.IdFacturaCompraNavigation.NroComprobante
                        }
                })
                .ToArray() ?? Array.Empty<api.Dtos.OrdenesPagosComprasDetalles.OrdenesPagosComprasDetalleDto>()
        };
    }
    protected override OrdenesPagosCompra ToEntity(OrdenesPagosCompraUpsertDto dto)
    {
        return new OrdenesPagosCompra
        {
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            
            OrdenesPagosComprasDetalles = dto.Detalles?.Select(d => new OrdenesPagosComprasDetalle
            {
                IdFacturaCompra = d.IdFacturaCompra,
                IdCuentaBancaria = d.IdCuentaBancaria,
                IdMedioPagoCompra = d.IdMedioPagoCompra,
                Monto = d.Monto
            }).ToList() ?? new List<OrdenesPagosComprasDetalle>()
        };
    }

    protected override int GetId(OrdenesPagosCompra entity)
    {
        return entity.IdOrdenPagoCompra;
    }

    protected override async Task<OrdenesPagosCompra> RefreshCreatedEntityAsync(OrdenesPagosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenPagoCompra) ?? entity;
    }
}
