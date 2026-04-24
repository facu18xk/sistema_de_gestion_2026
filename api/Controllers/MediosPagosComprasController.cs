using api.Dtos.MediosPagosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediosPagosComprasController : CrudControllerBase<MediosPagosCompra, MediosPagosCompraDto, MediosPagosCompraUpsertDto, int>
{
    public MediosPagosComprasController(ICrudService<MediosPagosCompra, int> service)
        : base(service)
    {
    }

    protected override MediosPagosCompraDto ToReadDto(MediosPagosCompra entity)
    {
        return new MediosPagosCompraDto
        {
            IdMedioPagoCompra = entity.IdMedioPagoCompra,
            Nombre = entity.Nombre
        };
    }

    protected override MediosPagosCompra ToEntity(MediosPagosCompraUpsertDto dto)
    {
        return new MediosPagosCompra
        {
            IdMedioPagoCompra = dto.IdMedioPagoCompra,
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(MediosPagosCompra entity)
    {
        return entity.IdMedioPagoCompra;
    }

    protected override async Task<MediosPagosCompra> RefreshCreatedEntityAsync(MediosPagosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdMedioPagoCompra) ?? entity;
    }
}