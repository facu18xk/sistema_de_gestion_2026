using api.Dtos.Timbrados;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimbradosController : CrudControllerBase<Timbrado, TimbradoDto, TimbradoUpsertDto, int>
{
    public TimbradosController(ICrudService<Timbrado, int> service)
        : base(service)
    {
    }

    protected override TimbradoDto ToReadDto(Timbrado entity)
    {
        return new TimbradoDto
        {
            IdTimbrado = entity.IdTimbrado,
            NumeroTimbrado = entity.NumeroTimbrado,
            FechaInicio = entity.FechaInicio,
            FechaFinal = entity.FechaFinal,
            Ruc = entity.Ruc,
            Establecimiento = entity.Establecimiento,
            PuntoExpedicion = entity.PuntoExpedicion,
            NumeroInicial = entity.NumeroInicial,
            NumeroFinal = entity.NumeroFinal,
            UltimoNumeroUsado = entity.UltimoNumeroUsado,
            TipoComprobante = entity.TipoComprobante,
            Activo = entity.Activo
        };
    }

    protected override Timbrado ToEntity(TimbradoUpsertDto dto)
    {
        return new Timbrado
        {
            NumeroTimbrado = dto.NumeroTimbrado,
            FechaInicio = dto.FechaInicio,
            FechaFinal = dto.FechaFinal,
            Ruc = dto.Ruc,
            Establecimiento = dto.Establecimiento,
            PuntoExpedicion = dto.PuntoExpedicion,
            NumeroInicial = dto.NumeroInicial,
            NumeroFinal = dto.NumeroFinal,
            UltimoNumeroUsado = dto.UltimoNumeroUsado,
            TipoComprobante = dto.TipoComprobante,
            Activo = dto.Activo
        };
    }

    protected override int GetId(Timbrado entity)
    {
        return entity.IdTimbrado;
    }
}
