using api.Dtos.FacturasVentas;
using api.Dtos.Common;
using api.Dtos.Ventas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasVentasController : CrudControllerBase<FacturasVenta, FacturasVentaDto, FacturasVentaUpsertDto, int>
{
    private readonly VentasCompletasService _ventasCompletasService;

    public FacturasVentasController(ICrudService<FacturasVenta, int> service, VentasCompletasService ventasCompletasService)
        : base(service)
    {
        _ventasCompletasService = ventasCompletasService;
    }

    [HttpPost("completo")]
    public async Task<ActionResult<FacturasVentaDto>> CreateCompleto(FacturaVentaCompletaCreateDto dto)
    {
        try
        {
            var createdEntity = await _ventasCompletasService.CreateFacturaVentaAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEntity.IdFacturaVenta }, ToReadDto(createdEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("completo")]
    public async Task<ActionResult<PagedResultDto<FacturaVentaCompletaDto>>> GetAllCompleto([FromQuery] PaginationQueryDto pagination)
    {
        var result = await _ventasCompletasService.GetFacturasVentasCompletasAsync(pagination);

        return Ok(result);
    }

    [HttpGet("{id:int}/completo")]
    public async Task<ActionResult<FacturaVentaCompletaDto>> GetByIdCompleto(int id)
    {
        var facturaVenta = await _ventasCompletasService.GetFacturaVentaCompletaAsync(id);
        if (facturaVenta is null)
        {
            return NotFound();
        }

        return Ok(facturaVenta);
    }

    protected override FacturasVentaDto ToReadDto(FacturasVenta entity)
    {
        return new FacturasVentaDto
        {
            IdFacturaVenta = entity.IdFacturaVenta,
            IdPresupuesto = entity.IdPresupuesto,
            PresupuestoDescripcion = entity.IdPresupuestoNavigation?.Descripcion ?? string.Empty,
            IdCliente = entity.IdCliente,
            Cliente = FormatCliente(entity.IdClienteNavigation),
            NroComprobante = entity.NroComprobante,
            IdTimbrado = entity.IdTimbrado,
            Timbrado = entity.IdTimbradoNavigation?.NumeroTimbrado ?? string.Empty,
            TimbradoRuc = entity.IdTimbradoNavigation?.Ruc ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,
            IdMedioPagoCompra = entity.IdMedioPagoCompra,
            MedioPagoCompra = entity.IdMedioPagoCompraNavigation?.Nombre ?? string.Empty,
            FechaPago = entity.FechaPago
        };
    }

    protected override FacturasVenta ToEntity(FacturasVentaUpsertDto dto)
    {
        return new FacturasVenta
        {
            IdPresupuesto = dto.IdPresupuesto,
            IdCliente = dto.IdCliente,
            NroComprobante = dto.NroComprobante,
            IdTimbrado = dto.IdTimbrado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            IdMedioPagoCompra = dto.IdMedioPagoCompra,
            FechaPago = dto.FechaPago
        };
    }

    protected override int GetId(FacturasVenta entity)
    {
        return entity.IdFacturaVenta;
    }

    protected override async Task<FacturasVenta> RefreshCreatedEntityAsync(FacturasVenta entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaVenta) ?? entity;
    }

    private static string FormatCliente(Cliente? cliente)
    {
        var persona = cliente?.IdPersonaNavigation;
        return persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim();
    }
}
