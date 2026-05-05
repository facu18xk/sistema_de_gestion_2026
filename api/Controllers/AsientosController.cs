using api.Dtos.Asientos;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsientosController : CrudControllerBase<Asiento, AsientoDto, AsientoUpsertDto, int>
{
    public AsientosController(ICrudService<Asiento, int> service) : base(service)
    {
    }

    protected override AsientoDto ToReadDto(Asiento entity)
    {
        return new AsientoDto
        {
            IdAsiento = entity.IdAsiento,
            NumeroAsiento = entity.NumeroAsiento,
            IdPeriodoContable = entity.IdPeriodoContable,
            PeriodoContable = $"{entity.IdPeriodoContableNavigation?.Anho}/{entity.IdPeriodoContableNavigation?.Mes}",
            IdModulo = entity.IdModulo,
            Modulo = entity.IdModuloNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,
            Automatico = entity.Automatico,
            Estado = entity.Estado,
            ReferenciaOrigen = entity.ReferenciaOrigen,
            IdOrigen = entity.IdOrigen,
            CreatedAt = entity.CreatedAt,
            FechaMayorizacion = entity.FechaMayorizacion
        };
    }

    protected override Asiento ToEntity(AsientoUpsertDto dto)
    {
        return new Asiento
        {
            NumeroAsiento = dto.NumeroAsiento,
            IdPeriodoContable = dto.IdPeriodoContable,
            IdModulo = dto.IdModulo,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            Automatico = dto.Automatico,
            Estado = dto.Estado,
            ReferenciaOrigen = dto.ReferenciaOrigen,
            IdOrigen = dto.IdOrigen,
            CreatedAt = dto.CreatedAt,
            FechaMayorizacion = dto.FechaMayorizacion
        };
    }

    protected override int GetId(Asiento entity)
    {
        return entity.IdAsiento;
    }

    protected override async Task<Asiento> RefreshCreatedEntityAsync(Asiento entity)
    {
        return await CrudService.GetByIdAsync(entity.IdAsiento) ?? entity;
    }
}
