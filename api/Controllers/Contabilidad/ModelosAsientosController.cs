using api.Dtos.ModelosAsientos;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelosAsientosController : CrudControllerBase<ModeloAsiento, ModeloAsientoDto, ModeloAsientoUpsertDto, int>
{
    public ModelosAsientosController(ICrudService<ModeloAsiento, int> service) : base(service)
    {
    }

    protected override ModeloAsientoDto ToReadDto(ModeloAsiento entity)
    {
        return new ModeloAsientoDto
        {
            IdModeloAsiento = entity.IdModeloAsiento,
            IdModulo = entity.IdModulo,
            Modulo = entity.IdModuloNavigation?.Nombre ?? string.Empty,
            TipoAsiento = entity.TipoAsiento,
            Descripcion = entity.Descripcion,
            DetalleResumen = entity.DetalleResumen,
            Activo = entity.Activo
        };
    }

    protected override ModeloAsiento ToEntity(ModeloAsientoUpsertDto dto)
    {
        return new ModeloAsiento
        {
            IdModulo = dto.IdModulo,
            TipoAsiento = dto.TipoAsiento,
            Descripcion = dto.Descripcion,
            DetalleResumen = dto.DetalleResumen,
            Activo = dto.Activo
        };
    }

    protected override int GetId(ModeloAsiento entity)
    {
        return entity.IdModeloAsiento;
    }

    protected override async Task<ModeloAsiento> RefreshCreatedEntityAsync(ModeloAsiento entity)
    {
        return await CrudService.GetByIdAsync(entity.IdModeloAsiento) ?? entity;
    }
}
