using api.Dtos.NotasDevolucionesCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace api.Controllers;

public class CambiarEstadoDto
{
    public string Estado { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class NotasDevolucionesComprasController : CrudControllerBase<NotasDevolucionesCompra, NotasDevolucionesCompraDto, NotasDevolucionesCompraUpsertDto, int>
{
    public NotasDevolucionesComprasController(ICrudService<NotasDevolucionesCompra, int> service)
        : base(service)
    {
    }

    protected override NotasDevolucionesCompraDto ToReadDto(NotasDevolucionesCompra entity)
    {
        return new NotasDevolucionesCompraDto
        {
            IdNotaDevolucionCompra = entity.IdNotaDevolucionCompra,
            IdFacturaCompra = entity.IdFacturaCompra,
            NroComprobanteFactura = entity.IdFacturaCompraNavigation?.NroComprobante ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Motivo = entity.Motivo,
            Fecha = entity.Fecha,

            Detalles = entity.NotasDevolucionesComprasDetalles?
                .Select(d => new NotasDevolucionesComprasDetalleDto
                {
                    IdNotaDevolucionCompraDetalle = d.IdNotaDevolucionCompraDetalle,
                    IdNotaDevolucionCompra = d.IdNotaDevolucionCompra,
                    IdProducto = d.IdProducto,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal,
                    Producto = d.IdProductoNavigation is null 
                        ? null 
                        : new ProductoNotaDevolucionDetalleDto 
                        {
                            IdProducto = d.IdProductoNavigation.IdProducto,
                            Descripcion = d.IdProductoNavigation.Descripcion
                        }
                })
                .ToArray() ?? Array.Empty<NotasDevolucionesComprasDetalleDto>()
        };
    }

    protected override NotasDevolucionesCompra ToEntity(NotasDevolucionesCompraUpsertDto dto)
    {
        return new NotasDevolucionesCompra
        {
            IdFacturaCompra = dto.IdFacturaCompra,
            IdEstado = dto.IdEstado,
            Motivo = dto.Motivo,
            Fecha = dto.Fecha
        };
    }

    protected override int GetId(NotasDevolucionesCompra entity)
    {
        return entity.IdNotaDevolucionCompra;
    }

    [HttpPut("{id}/estado")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
    {
        try
        {
            var service = CrudService as NotasDevolucionesCompraService;
            if (service == null) return StatusCode(500, new { message = "Service no configurado correctamente." });

            var result = await service.CambiarEstadoAsync(id, dto.Estado);
            return Ok(ToReadDto(result));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override async Task<NotasDevolucionesCompra> RefreshCreatedEntityAsync(NotasDevolucionesCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaDevolucionCompra) ?? entity;
    }
}