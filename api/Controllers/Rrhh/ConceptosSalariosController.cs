using api.Dtos.Rrhh;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConceptosSalariosController : CrudControllerBase<ConceptoSalario, ConceptoSalarioDto, ConceptoSalarioUpsertDto, int>
{
    public ConceptosSalariosController(ICrudService<ConceptoSalario, int> service) : base(service)
    {
    }

    protected override ConceptoSalarioDto ToReadDto(ConceptoSalario entity)
    {
        return new ConceptoSalarioDto
        {
            IdConceptoSalario = entity.IdConceptoSalario,
            Codigo = entity.Codigo,
            Descripcion = entity.Descripcion,
            Tipo = entity.Tipo,
            DeducibleIps = entity.DeducibleIps,
            EsSalarioBase = entity.EsSalarioBase,
            EsIps = entity.EsIps,
            EsBonificacionFamiliar = entity.EsBonificacionFamiliar,
            Activo = entity.Activo
        };
    }

    protected override ConceptoSalario ToEntity(ConceptoSalarioUpsertDto dto)
    {
        return new ConceptoSalario
        {
            IdConceptoSalario = dto.IdConceptoSalario,
            Codigo = dto.Codigo,
            Descripcion = dto.Descripcion,
            Tipo = dto.Tipo,
            DeducibleIps = dto.DeducibleIps,
            EsSalarioBase = dto.EsSalarioBase,
            EsIps = dto.EsIps,
            EsBonificacionFamiliar = dto.EsBonificacionFamiliar,
            Activo = dto.Activo
        };
    }

    protected override int GetId(ConceptoSalario entity) => entity.IdConceptoSalario;
}
