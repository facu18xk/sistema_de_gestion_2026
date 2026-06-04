using api.Dtos.Common;
using api.Dtos.Rrhh;
using api.Models;

namespace api.Services;

public interface IPagoSalarioService
{
    Task<PagedResultDto<ProcesoPagoSalarioDto>> GetProcesosAsync(PaginationQueryDto pagination);

    Task<ProcesoPagoSalarioDto?> GetProcesoAsync(int id);

    Task<List<PagoSalarioDetalleDto>> GetDetallesAsync(int idProcesoPagoSalario);

    Task<ProcesoPagoSalarioDto> CreateProcesoAsync(ProcesoPagoSalarioUpsertDto dto);

    Task<ProcesoPagoSalarioDto> GenerateAsync(int idProcesoPagoSalario);

    Task<PagoSalarioDetalleDto> AddDetalleAsync(int idProcesoPagoSalario, PagoSalarioDetalleUpsertDto dto);

    Task<PagoSalarioDetalleDto> UpdateDetalleAsync(int idProcesoPagoSalario, int idDetalle, PagoSalarioDetalleUpsertDto dto);

    Task DeleteDetalleAsync(int idProcesoPagoSalario, int idDetalle);

    Task<ProcesoPagoSalarioDto> VerifyAsync(int idProcesoPagoSalario);

    Task<ProcesoPagoSalarioDto> CloseAsync(int idProcesoPagoSalario, CerrarProcesoPagoSalarioDto dto);

    Task<List<ReciboPagoSalarioDto>> GetRecibosAsync(int idProcesoPagoSalario, int? idEmpleado = null);
}
