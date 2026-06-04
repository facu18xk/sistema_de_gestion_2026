using api.Dtos.FacturasComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasComprasDetallesController : CrudControllerBase<FacturasComprasDetalle, FacturasComprasDetalleDto, FacturasComprasDetalleUpsertDto, int>
{
    public FacturasComprasDetallesController(ICrudService<FacturasComprasDetalle, int> service)
        : base(service)
    {
    }

    protected override FacturasComprasDetalleDto ToReadDto(FacturasComprasDetalle entity)
    {
        var producto = entity.IdProductoNavigation;

        return new FacturasComprasDetalleDto
        {
            IdFacturaCompraDetalle = entity.IdFacturaCompraDetalle,
            IdFacturaCompra = entity.IdFacturaCompra,
            IdProducto = entity.IdProducto,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            TotalBruto = entity.TotalBruto,
            TotalIva = entity.TotalIva,
            TotalNeto = entity.TotalNeto,
            Producto = producto is null 
                ? null 
                : new ProductoFacturaDetalleDto 
                {
                    IdProducto = producto.IdProducto,
                    Descripcion = producto.Descripcion 
                }
        };
    }

    protected override FacturasComprasDetalle ToEntity(FacturasComprasDetalleUpsertDto dto)
    {
        return new FacturasComprasDetalle
        {
            IdFacturaCompra = dto.IdFacturaCompra,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            TotalBruto = dto.TotalBruto,
            TotalIva = dto.TotalIva,
            TotalNeto = dto.TotalNeto
        };
    }

    protected override int GetId(FacturasComprasDetalle entity)
    {
        return entity.IdFacturaCompraDetalle;
    }

    protected override async Task<FacturasComprasDetalle> RefreshCreatedEntityAsync(FacturasComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaCompraDetalle) ?? entity;
    }
}