using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DetallesDepositosBancariosController : CrudControllerBase<DetalleDepositoBancario, DetalleDepositoBancarioDto, DetalleDepositoBancarioUpsertDto, int>
{
    public DetallesDepositosBancariosController(ICrudService<DetalleDepositoBancario, int> service) : base(service) { }

    protected override DetalleDepositoBancarioDto ToReadDto(DetalleDepositoBancario entity) => new()
    {
        IdDetalleDepositoBancario = entity.IdDetalleDepositoBancario,
        IdDepositoBancario = entity.IdDepositoBancario,
        Monto = entity.Monto,
        Descripcion = entity.Descripcion
    };

    protected override DetalleDepositoBancario ToEntity(DetalleDepositoBancarioUpsertDto dto) => new()
    {
        IdDepositoBancario = dto.IdDepositoBancario,
        Monto = dto.Monto,
        Descripcion = dto.Descripcion
    };

    protected override int GetId(DetalleDepositoBancario entity) => entity.IdDetalleDepositoBancario;
}
