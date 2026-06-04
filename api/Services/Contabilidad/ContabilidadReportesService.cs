using api.Dtos.Contabilidad;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ContabilidadReportesService : IContabilidadReportesService
{
    private readonly DblosAmigosContext _context;

    public ContabilidadReportesService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<LibroDiarioReporteDto> GetLibroDiarioAsync(int idPeriodoContable)
    {
        return ContabilidadReportesCalculator.BuildLibroDiario(await BuildReporteBaseAsync(idPeriodoContable));
    }

    public async Task<LibroMayorReporteDto> GetLibroMayorAsync(int idPeriodoContable)
    {
        return ContabilidadReportesCalculator.BuildLibroMayor(await BuildReporteBaseAsync(idPeriodoContable));
    }

    public async Task<BalanceSumasYSaldosReporteDto> GetBalanceSumasYSaldosAsync(int idPeriodoContable)
    {
        return ContabilidadReportesCalculator.BuildBalanceSumasYSaldos(await BuildReporteBaseAsync(idPeriodoContable));
    }

    public async Task<BalanceGeneralReporteDto> GetBalanceGeneralAsync(int idPeriodoContable)
    {
        return ContabilidadReportesCalculator.BuildBalanceGeneral(await BuildReporteBaseAsync(idPeriodoContable));
    }

    public async Task<BalanceResultadosReporteDto> GetBalanceResultadosAsync(int idPeriodoContable)
    {
        return ContabilidadReportesCalculator.BuildBalanceResultados(await BuildReporteBaseAsync(idPeriodoContable));
    }

    private async Task<ContabilidadReporteBaseData> BuildReporteBaseAsync(int idPeriodoContable)
    {
        var periodo = await _context.PeriodosContables
            .AsNoTracking()
            .Include(item => item.IdProcesoContableNavigation)
            .FirstOrDefaultAsync(item => item.IdPeriodoContable == idPeriodoContable);

        if (periodo is null)
        {
            throw new InvalidOperationException("No existe el periodo contable indicado.");
        }

        var cabecera = new ReporteContableCabeceraDto
        {
            IdPeriodoContable = periodo.IdPeriodoContable,
            IdProcesoContable = periodo.IdProcesoContable,
            Anho = periodo.Anho,
            Mes = periodo.Mes,
            FechaInicio = periodo.FechaInicio,
            FechaFin = periodo.FechaFin,
            FechaEmision = DateTime.UtcNow,
            Moneda = periodo.IdProcesoContableNavigation.Moneda
        };

        var cuentas = await _context.CuentasContables
            .AsNoTracking()
            .Where(item => item.IdProcesoContable == periodo.IdProcesoContable
                && item.Activa
                && item.EsAsentable)
            .OrderBy(item => item.NumeroCuenta)
            .ToListAsync();

        var movimientos = await _context.AsientosDetalles
            .AsNoTracking()
            .Include(item => item.IdAsientoNavigation)
            .Include(item => item.IdCuentaContableNavigation)
            .Where(item => item.IdCuentaContableNavigation.IdProcesoContable == periodo.IdProcesoContable
                && item.IdCuentaContableNavigation.Activa
                && item.IdCuentaContableNavigation.EsAsentable
                && item.IdAsientoNavigation.Fecha <= periodo.FechaFin)
            .ToListAsync();

        var movimientosDto = movimientos
            .Where(item => ContabilidadRules.IsEnabled(item.IdAsientoNavigation.Estado))
            .Select(ToMovimientoContable)
            .OrderBy(item => item.Fecha)
            .ThenBy(item => item.NumeroAsiento)
            .ThenBy(item => item.Item)
            .ToList();

        return new ContabilidadReporteBaseData(
            cabecera,
            cuentas,
            movimientosDto.Where(item => item.Fecha < periodo.FechaInicio).ToList(),
            movimientosDto.Where(item => item.Fecha >= periodo.FechaInicio && item.Fecha <= periodo.FechaFin).ToList(),
            movimientosDto);
    }

    private static MovimientoContableReporteData ToMovimientoContable(AsientosDetalle item)
    {
        var debe = ContabilidadRules.IsDebe(item.TipoMovimiento) ? item.Monto : 0;
        var haber = ContabilidadRules.IsHaber(item.TipoMovimiento) ? item.Monto : 0;

        return new MovimientoContableReporteData(
            item.IdAsientoDetalle,
            item.IdAsiento,
            item.IdAsientoNavigation.NumeroAsiento,
            item.IdAsientoNavigation.Fecha,
            item.IdAsientoNavigation.Descripcion,
            item.IdAsientoNavigation.ReferenciaOrigen,
            item.IdAsientoNavigation.IdOrigen,
            item.IdCuentaContable,
            item.IdCuentaContableNavigation.NumeroCuenta,
            item.IdCuentaContableNavigation.Nombre,
            item.IdCuentaContableNavigation.TipoCuenta,
            item.Item,
            item.TipoMovimiento,
            item.DescripcionItem,
            debe,
            haber);
    }
}
