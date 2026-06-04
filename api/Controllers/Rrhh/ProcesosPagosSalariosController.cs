using api.Dtos.Common;
using api.Dtos.Rrhh;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcesosPagosSalariosController : ControllerBase
{
    private readonly IPagoSalarioService _pagoSalarioService;

    public ProcesosPagosSalariosController(IPagoSalarioService pagoSalarioService)
    {
        _pagoSalarioService = pagoSalarioService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ProcesoPagoSalarioDto>>> GetAll([FromQuery] PaginationQueryDto pagination)
    {
        return Ok(await _pagoSalarioService.GetProcesosAsync(pagination));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProcesoPagoSalarioDto>> GetById(int id)
    {
        var proceso = await _pagoSalarioService.GetProcesoAsync(id);
        return proceso is null ? NotFound() : Ok(proceso);
    }

    [HttpPost]
    public async Task<ActionResult<ProcesoPagoSalarioDto>> Create(ProcesoPagoSalarioUpsertDto dto)
    {
        try
        {
            var created = await _pagoSalarioService.CreateProcesoAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.IdProcesoPagoSalario }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/detalles")]
    public async Task<ActionResult<List<PagoSalarioDetalleDto>>> GetDetalles(int id)
    {
        try
        {
            return Ok(await _pagoSalarioService.GetDetallesAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id:int}/generar")]
    public async Task<ActionResult<ProcesoPagoSalarioDto>> Generate(int id)
    {
        try
        {
            return Ok(await _pagoSalarioService.GenerateAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/detalles")]
    public async Task<ActionResult<PagoSalarioDetalleDto>> AddDetalle(int id, PagoSalarioDetalleUpsertDto dto)
    {
        try
        {
            var created = await _pagoSalarioService.AddDetalleAsync(id, dto);
            return CreatedAtAction(nameof(GetDetalles), new { id }, created);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}/detalles/{idDetalle:int}")]
    public async Task<ActionResult<PagoSalarioDetalleDto>> UpdateDetalle(int id, int idDetalle, PagoSalarioDetalleUpsertDto dto)
    {
        try
        {
            return Ok(await _pagoSalarioService.UpdateDetalleAsync(id, idDetalle, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}/detalles/{idDetalle:int}")]
    public async Task<IActionResult> DeleteDetalle(int id, int idDetalle)
    {
        try
        {
            await _pagoSalarioService.DeleteDetalleAsync(id, idDetalle);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/verificar")]
    public async Task<ActionResult<ProcesoPagoSalarioDto>> Verify(int id)
    {
        try
        {
            return Ok(await _pagoSalarioService.VerifyAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/cerrar")]
    public async Task<ActionResult<ProcesoPagoSalarioDto>> Close(int id, CerrarProcesoPagoSalarioDto dto)
    {
        try
        {
            return Ok(await _pagoSalarioService.CloseAsync(id, dto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/recibos")]
    public async Task<ActionResult<List<ReciboPagoSalarioDto>>> GetRecibos(int id)
    {
        try
        {
            return Ok(await _pagoSalarioService.GetRecibosAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/empleados/{idEmpleado:int}/recibo")]
    public async Task<ActionResult<List<ReciboPagoSalarioDto>>> GetReciboEmpleado(int id, int idEmpleado)
    {
        try
        {
            return Ok(await _pagoSalarioService.GetRecibosAsync(id, idEmpleado));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
