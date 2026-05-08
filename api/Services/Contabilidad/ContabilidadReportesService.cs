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

    public async Task<List<LibroDiarioLineaDto>> GetLibroDiarioAsync(int idPeriodoContable)
    {
        await EnsurePeriodoExistsAsync(idPeriodoContable);

        return await BaseMovimientos(idPeriodoContable)
            .OrderBy(item => item.IdAsientoNavigation.Fecha)
            .ThenBy(item => item.IdAsientoNavigation.NumeroAsiento)
            .ThenBy(item => item.Item)
            .Select(item => new LibroDiarioLineaDto
            {
                IdAsiento = item.IdAsiento,
                NumeroAsiento = item.IdAsientoNavigation.NumeroAsiento,
                Fecha = item.IdAsientoNavigation.Fecha,
                Descripcion = item.DescripcionItem ?? item.IdAsientoNavigation.Descripcion,
                Item = item.Item,
                IdCuentaContable = item.IdCuentaContable,
                NumeroCuenta = item.IdCuentaContableNavigation.NumeroCuenta,
                CuentaContable = item.IdCuentaContableNavigation.Nombre,
                Debe = item.TipoMovimiento.ToLower() == "debe" ? item.Monto : 0,
                Haber = item.TipoMovimiento.ToLower() == "haber" ? item.Monto : 0
            })
            .ToListAsync();
    }

    public async Task<List<LibroMayorCuentaDto>> GetLibroMayorAsync(int idPeriodoContable)
    {
        var diario = await GetLibroDiarioAsync(idPeriodoContable);

        return diario
            .GroupBy(item => new { item.IdCuentaContable, item.NumeroCuenta, item.CuentaContable })
            .OrderBy(group => group.Key.NumeroCuenta)
            .Select(group =>
            {
                var totalDebe = group.Sum(item => item.Debe);
                var totalHaber = group.Sum(item => item.Haber);
                var saldo = totalDebe - totalHaber;

                return new LibroMayorCuentaDto
                {
                    IdCuentaContable = group.Key.IdCuentaContable,
                    NumeroCuenta = group.Key.NumeroCuenta,
                    CuentaContable = group.Key.CuentaContable,
                    TotalDebe = totalDebe,
                    TotalHaber = totalHaber,
                    SaldoDeudor = saldo > 0 ? saldo : 0,
                    SaldoAcreedor = saldo < 0 ? Math.Abs(saldo) : 0,
                    Movimientos = group
                        .OrderBy(item => item.Fecha)
                        .ThenBy(item => item.NumeroAsiento)
                        .Select(item => new LibroMayorMovimientoDto
                        {
                            IdAsiento = item.IdAsiento,
                            NumeroAsiento = item.NumeroAsiento,
                            Fecha = item.Fecha,
                            Descripcion = item.Descripcion,
                            Debe = item.Debe,
                            Haber = item.Haber
                        })
                        .ToList()
                };
            })
            .ToList();
    }

    public async Task<List<BalanceLineaDto>> GetBalanceSumasYSaldosAsync(int idPeriodoContable)
    {
        await EnsurePeriodoExistsAsync(idPeriodoContable);

        var lineas = await BaseMovimientos(idPeriodoContable)
            .GroupBy(item => new
            {
                item.IdCuentaContable,
                item.IdCuentaContableNavigation.NumeroCuenta,
                item.IdCuentaContableNavigation.Nombre,
                item.IdCuentaContableNavigation.TipoCuenta
            })
            .Select(group => new
            {
                group.Key.IdCuentaContable,
                group.Key.NumeroCuenta,
                CuentaContable = group.Key.Nombre,
                group.Key.TipoCuenta,
                TotalDebe = group.Where(item => item.TipoMovimiento.ToLower() == "debe").Sum(item => item.Monto),
                TotalHaber = group.Where(item => item.TipoMovimiento.ToLower() == "haber").Sum(item => item.Monto)
            })
            .OrderBy(item => item.NumeroCuenta)
            .ToListAsync();

        return lineas.Select(item => ToBalanceLinea(
                item.IdCuentaContable,
                item.NumeroCuenta,
                item.CuentaContable,
                item.TipoCuenta,
                item.TotalDebe,
                item.TotalHaber))
            .ToList();
    }

    public async Task<List<BalanceLineaDto>> GetBalanceGeneralAsync(int idPeriodoContable)
    {
        var balance = await GetBalanceSumasYSaldosAsync(idPeriodoContable);
        return balance
            .Where(item => IsAnyTipo(item.TipoCuenta, "activo", "pasivo", "patrimonio", "capital"))
            .ToList();
    }

    public async Task<List<BalanceLineaDto>> GetBalanceResultadosAsync(int idPeriodoContable)
    {
        var balance = await GetBalanceSumasYSaldosAsync(idPeriodoContable);
        return balance
            .Where(item => IsAnyTipo(item.TipoCuenta, "ingreso", "venta", "gasto", "egreso", "costo", "resultado"))
            .ToList();
    }

    private IQueryable<AsientosDetalle> BaseMovimientos(int idPeriodoContable)
    {
        return _context.AsientosDetalles
            .AsNoTracking()
            .Include(item => item.IdAsientoNavigation)
            .Include(item => item.IdCuentaContableNavigation)
            .Where(item => item.IdAsientoNavigation.IdPeriodoContable == idPeriodoContable);
    }

    private async Task EnsurePeriodoExistsAsync(int idPeriodoContable)
    {
        var exists = await _context.PeriodosContables
            .AnyAsync(item => item.IdPeriodoContable == idPeriodoContable);

        if (!exists)
        {
            throw new InvalidOperationException("No existe el periodo contable indicado.");
        }
    }

    private static BalanceLineaDto ToBalanceLinea(
        int idCuentaContable,
        string numeroCuenta,
        string cuentaContable,
        string tipoCuenta,
        decimal totalDebe,
        decimal totalHaber)
    {
        var saldo = totalDebe - totalHaber;

        return new BalanceLineaDto
        {
            IdCuentaContable = idCuentaContable,
            NumeroCuenta = numeroCuenta,
            CuentaContable = cuentaContable,
            TipoCuenta = tipoCuenta,
            TotalDebe = totalDebe,
            TotalHaber = totalHaber,
            SaldoDeudor = saldo > 0 ? saldo : 0,
            SaldoAcreedor = saldo < 0 ? Math.Abs(saldo) : 0,
            Saldo = saldo
        };
    }

    private static bool IsAnyTipo(string tipoCuenta, params string[] values)
    {
        return values.Any(value => tipoCuenta.Contains(value, StringComparison.OrdinalIgnoreCase));
    }
}
