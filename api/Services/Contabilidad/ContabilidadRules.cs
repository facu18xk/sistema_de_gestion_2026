using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public static class ContabilidadRules
{
    public static bool IsEnabled(string? estado)
    {
        if (string.IsNullOrWhiteSpace(estado))
        {
            return true;
        }

        return ContabilidadEstados.EstadosHabilitados.Contains(
            estado.Trim(),
            StringComparer.OrdinalIgnoreCase);
    }

    public static bool IsDebe(string tipoMovimiento)
    {
        return string.Equals(tipoMovimiento.Trim(), "Debe", StringComparison.OrdinalIgnoreCase);
    }

    public static bool IsHaber(string tipoMovimiento)
    {
        return string.Equals(tipoMovimiento.Trim(), "Haber", StringComparison.OrdinalIgnoreCase);
    }

    public static void ValidateMovimiento(string tipoMovimiento, decimal monto)
    {
        if (!IsDebe(tipoMovimiento) && !IsHaber(tipoMovimiento))
        {
            throw new InvalidOperationException("El tipo de movimiento debe ser Debe o Haber.");
        }

        if (monto <= 0)
        {
            throw new InvalidOperationException("El monto del detalle debe ser mayor a cero.");
        }
    }

    public static void ValidatePeriodoContable(PeriodoContable periodo)
    {
        if (!IsEnabled(periodo.Estado) || !IsEnabled(periodo.IdProcesoContableNavigation.Estado))
        {
            throw new InvalidOperationException("El periodo contable no se encuentra habilitado.");
        }
    }

    public static void ValidateFechaDentroPeriodo(DateOnly fecha, PeriodoContable periodo)
    {
        if (fecha < periodo.FechaInicio || fecha > periodo.FechaFin)
        {
            throw new InvalidOperationException("La fecha del asiento debe estar dentro del periodo contable.");
        }
    }

    public static async Task<PeriodoContable> GetEnabledPeriodoAsync(
        DblosAmigosContext context,
        int idPeriodoContable)
    {
        var periodo = await context.PeriodosContables
            .Include(item => item.IdProcesoContableNavigation)
            .FirstOrDefaultAsync(item => item.IdPeriodoContable == idPeriodoContable);

        if (periodo is null)
        {
            throw new InvalidOperationException("No existe el periodo contable indicado.");
        }

        ValidatePeriodoContable(periodo);
        return periodo;
    }

    public static async Task<PeriodoContable> GetEnabledPeriodoByFechaAsync(
        DblosAmigosContext context,
        DateOnly fecha)
    {
        var periodos = await context.PeriodosContables
            .Include(item => item.IdProcesoContableNavigation)
            .Where(item => item.FechaInicio <= fecha && item.FechaFin >= fecha)
            .ToListAsync();

        var enabledPeriodos = periodos
            .Where(item => IsEnabled(item.Estado) && IsEnabled(item.IdProcesoContableNavigation.Estado))
            .ToList();

        if (enabledPeriodos.Count == 0)
        {
            throw new InvalidOperationException("No existe un periodo contable habilitado para la fecha indicada.");
        }

        if (enabledPeriodos.Count > 1)
        {
            throw new InvalidOperationException("Existe más de un periodo contable habilitado para la fecha indicada.");
        }

        return enabledPeriodos[0];
    }

    public static async Task ValidateCuentaAsentableAsync(
        DblosAmigosContext context,
        int idCuentaContable,
        int idProcesoContable)
    {
        var cuenta = await context.CuentasContables
            .Include(item => item.IdProcesoContableNavigation)
            .FirstOrDefaultAsync(item => item.IdCuentaContable == idCuentaContable);

        if (cuenta is null)
        {
            throw new InvalidOperationException("No existe la cuenta contable indicada.");
        }

        if (cuenta.IdProcesoContable != idProcesoContable)
        {
            throw new InvalidOperationException("La cuenta contable no pertenece al proceso del periodo contable.");
        }

        if (!cuenta.Activa || !cuenta.EsAsentable)
        {
            throw new InvalidOperationException("Solo se puede imputar a cuentas activas y asentables.");
        }

        if (!IsEnabled(cuenta.IdProcesoContableNavigation.Estado))
        {
            throw new InvalidOperationException("El proceso contable de la cuenta no se encuentra habilitado.");
        }
    }

    public static void ValidatePartidaDoble(IEnumerable<(string TipoMovimiento, decimal Monto)> detalles)
    {
        var detalleList = detalles.ToList();
        if (detalleList.Count == 0)
        {
            throw new InvalidOperationException("El asiento debe tener al menos un detalle.");
        }

        foreach (var detalle in detalleList)
        {
            ValidateMovimiento(detalle.TipoMovimiento, detalle.Monto);
        }

        var totalDebe = detalleList
            .Where(item => IsDebe(item.TipoMovimiento))
            .Sum(item => item.Monto);
        var totalHaber = detalleList
            .Where(item => IsHaber(item.TipoMovimiento))
            .Sum(item => item.Monto);

        if (totalDebe != totalHaber)
        {
            throw new InvalidOperationException("El asiento no cumple partida doble: el total del Debe debe coincidir con el total del Haber.");
        }
    }
}
