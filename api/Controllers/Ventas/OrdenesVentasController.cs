using api.Dtos.OrdenesVentas;
using api.Dtos.Ventas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesVentasController : CrudControllerBase<OrdenesVenta, OrdenesVentaDto, OrdenesVentaUpsertDto, int>
{
    private readonly VentasCompletasService _ventasCompletasService;

    public OrdenesVentasController(ICrudService<OrdenesVenta, int> service, VentasCompletasService ventasCompletasService)
        : base(service)
    {
        _ventasCompletasService = ventasCompletasService;
    }

    [HttpPost("completo")]
    public async Task<ActionResult<OrdenesVentaDto>> CreateCompleto(OrdenVentaCompletaCreateDto dto)
    {
        try
        {
            var createdEntity = await _ventasCompletasService.CreateOrdenVentaAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEntity.IdOrdenVenta }, ToReadDto(createdEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override OrdenesVentaDto ToReadDto(OrdenesVenta entity)
    {
        return new OrdenesVentaDto
        {
            IdOrdenVenta = entity.IdOrdenVenta,
            IdPresupuesto = entity.IdPresupuesto,
            PresupuestoDescripcion = entity.IdPresupuestoNavigation?.Descripcion ?? string.Empty,
            IdCliente = entity.IdCliente,
            Cliente = FormatCliente(entity.IdClienteNavigation),
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override OrdenesVenta ToEntity(OrdenesVentaUpsertDto dto)
    {
        return new OrdenesVenta
        {
            IdPresupuesto = dto.IdPresupuesto,
            IdCliente = dto.IdCliente,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(OrdenesVenta entity)
    {
        return entity.IdOrdenVenta;
    }

    protected override async Task<OrdenesVenta> RefreshCreatedEntityAsync(OrdenesVenta entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenVenta) ?? entity;
    }

    private static string FormatCliente(Cliente? cliente)
    {
        var persona = cliente?.IdPersonaNavigation;
        return persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim();
    }
}
