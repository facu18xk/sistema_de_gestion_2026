using api.Dtos.Contabilidad;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/contabilidad/reportes")]
public class ContabilidadReportesController : ControllerBase
{
    private readonly IContabilidadReportesService _reportesService;

    public ContabilidadReportesController(IContabilidadReportesService reportesService)
    {
        _reportesService = reportesService;
    }

    [HttpGet("libro-diario/{idPeriodoContable:int}")]
    public async Task<ActionResult<List<LibroDiarioLineaDto>>> GetLibroDiario(int idPeriodoContable)
    {
        return await ExecuteAsync(() => _reportesService.GetLibroDiarioAsync(idPeriodoContable));
    }

    [HttpGet("libro-mayor/{idPeriodoContable:int}")]
    public async Task<ActionResult<List<LibroMayorCuentaDto>>> GetLibroMayor(int idPeriodoContable)
    {
        return await ExecuteAsync(() => _reportesService.GetLibroMayorAsync(idPeriodoContable));
    }

    [HttpGet("balance-sumas-saldos/{idPeriodoContable:int}")]
    public async Task<ActionResult<List<BalanceLineaDto>>> GetBalanceSumasYSaldos(int idPeriodoContable)
    {
        return await ExecuteAsync(() => _reportesService.GetBalanceSumasYSaldosAsync(idPeriodoContable));
    }

    [HttpGet("balance-general/{idPeriodoContable:int}")]
    public async Task<ActionResult<List<BalanceLineaDto>>> GetBalanceGeneral(int idPeriodoContable)
    {
        return await ExecuteAsync(() => _reportesService.GetBalanceGeneralAsync(idPeriodoContable));
    }

    [HttpGet("balance-resultados/{idPeriodoContable:int}")]
    public async Task<ActionResult<List<BalanceLineaDto>>> GetBalanceResultados(int idPeriodoContable)
    {
        return await ExecuteAsync(() => _reportesService.GetBalanceResultadosAsync(idPeriodoContable));
    }

    private async Task<ActionResult<List<T>>> ExecuteAsync<T>(Func<Task<List<T>>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
