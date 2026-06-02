using api.Dtos.NotasCreditosVentas;
using api.Dtos.NotasCreditosVentasDetalles;
using api.Dtos.Ventas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasCreditosVentasController : CrudControllerBase<NotasCreditosVenta, NotasCreditosVentaDto, NotasCreditosVentaUpdateDto, int>
{
    private readonly VentasCompletasService _ventasCompletasService;

    public NotasCreditosVentasController(
        ICrudService<NotasCreditosVenta, int> service,
        VentasCompletasService ventasCompletasService)
        : base(service)
    {
        _ventasCompletasService = ventasCompletasService;
    }

    [HttpPost]
    public async Task<ActionResult<NotasCreditosVentaDto>> Create(NotasCreditosVentaCreateDto dto)
    {
        return await CreateFromCompletaDto(new NotaCreditoVentaCompletaCreateDto
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdEstado = dto.IdEstado,
            NroComprobante = dto.NroComprobante,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Items = dto.Items
        });
    }

    [NonAction]
    public override Task<ActionResult<NotasCreditosVentaDto>> Create(NotasCreditosVentaUpdateDto dto)
    {
        return base.Create(dto);
    }

    [HttpPost("completo")]
    public async Task<ActionResult<NotasCreditosVentaDto>> CreateCompleto(NotaCreditoVentaCompletaCreateDto dto)
    {
        return await CreateFromCompletaDto(dto);
    }

    [HttpPut("{id:int}")]
    public override async Task<ActionResult<NotasCreditosVentaDto>> Update(int id, NotasCreditosVentaUpdateDto dto)
    {
        return await UpdateFromCompletaDto(id, new NotaCreditoVentaCompletaUpdateDto
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdEstado = dto.IdEstado,
            IdTimbrado = dto.IdTimbrado,
            NroComprobante = dto.NroComprobante,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Items = dto.Items
        });
    }

    [HttpPut("completo/{id:int}")]
    public async Task<ActionResult<NotasCreditosVentaDto>> UpdateCompleto(int id, NotaCreditoVentaCompletaUpdateDto dto)
    {
        return await UpdateFromCompletaDto(id, dto);
    }

    private async Task<ActionResult<NotasCreditosVentaDto>> CreateFromCompletaDto(NotaCreditoVentaCompletaCreateDto dto)
    {
        try
        {
            var createdEntity = await _ventasCompletasService.CreateNotaCreditoVentaAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEntity.IdNotaCreditoVenta }, ToReadDto(createdEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private async Task<ActionResult<NotasCreditosVentaDto>> UpdateFromCompletaDto(int id, NotaCreditoVentaCompletaUpdateDto dto)
    {
        try
        {
            var updatedEntity = await _ventasCompletasService.UpdateNotaCreditoVentaAsync(id, dto);
            return Ok(ToReadDto(updatedEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    protected override NotasCreditosVentaDto ToReadDto(NotasCreditosVenta entity)
    {
        return new NotasCreditosVentaDto
        {
            IdNotaCreditoVenta = entity.IdNotaCreditoVenta,
            IdFacturaVenta = entity.IdFacturaVenta,
            FacturaVenta = entity.IdFacturaVentaNavigation?.NroComprobante ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            IdNotaDevolucionVenta = entity.IdNotaDevolucionVenta,
            NotaDevolucionVenta = entity.IdNotaDevolucionVentaNavigation?.Motivo ?? string.Empty,
            IdTimbrado = entity.IdTimbrado,
            Timbrado = entity.IdTimbradoNavigation?.NumeroTimbrado ?? string.Empty,
            NroComprobante = entity.NroComprobante,
            Motivo = entity.Motivo,
            FechaEmision = entity.FechaEmision,
            Total = entity.Total,
            Detalles = entity.NotasCreditosVentasDetalles.Select(detalle => new NotasCreditosVentasDetalleDto
            {
                IdNotaCreditoVentaDetalle = detalle.IdNotaCreditoVentaDetalle,
                IdNotaCreditoVenta = detalle.IdNotaCreditoVenta,
                IdProducto = detalle.IdProducto,
                Producto = detalle.IdProductoNavigation?.Descripcion ?? string.Empty,
                Cantidad = detalle.Cantidad,
                PrecioUnitario = detalle.PrecioUnitario,
                Subtotal = detalle.Subtotal
            }).ToArray()
        };
    }

    protected override NotasCreditosVenta ToEntity(NotasCreditosVentaUpdateDto dto)
    {
        return new NotasCreditosVenta
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdEstado = dto.IdEstado,
            IdNotaDevolucionVenta = dto.IdNotaDevolucionVenta,
            IdTimbrado = dto.IdTimbrado,
            NroComprobante = dto.NroComprobante ?? string.Empty,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Total = dto.Total
        };
    }

    protected override int GetId(NotasCreditosVenta entity)
    {
        return entity.IdNotaCreditoVenta;
    }

    protected override async Task<NotasCreditosVenta> RefreshCreatedEntityAsync(NotasCreditosVenta entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaCreditoVenta) ?? entity;
    }
}
