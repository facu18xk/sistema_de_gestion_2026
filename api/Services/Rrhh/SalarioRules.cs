using api.Models;

namespace api.Services;

public static class SalarioRules
{
    public const string TipoIngreso = "Ingreso";
    public const string TipoEgreso = "Egreso";

    public static string NormalizeTipo(string tipo)
    {
        if (string.Equals(tipo.Trim(), TipoIngreso, StringComparison.OrdinalIgnoreCase))
        {
            return TipoIngreso;
        }

        if (string.Equals(tipo.Trim(), TipoEgreso, StringComparison.OrdinalIgnoreCase))
        {
            return TipoEgreso;
        }

        throw new InvalidOperationException("El tipo de concepto debe ser Ingreso o Egreso.");
    }

    public static decimal CalcularIps(IEnumerable<PagoSalarioDetalle> detalles, decimal porcentajeIpsEmpleado)
    {
        var baseIps = detalles
            .Where(item => item.Tipo == TipoIngreso && item.DeducibleIps)
            .Sum(item => item.Monto);

        return decimal.Round(baseIps * porcentajeIpsEmpleado / 100m, 2, MidpointRounding.AwayFromZero);
    }

    public static decimal CalcularBonificacionFamiliar(
        int cantidadHijosMenores,
        decimal salarioMinimo,
        decimal porcentajeBonificacionFamiliar)
    {
        if (cantidadHijosMenores <= 0)
        {
            return 0m;
        }

        return decimal.Round(
            salarioMinimo * porcentajeBonificacionFamiliar / 100m * cantidadHijosMenores,
            2,
            MidpointRounding.AwayFromZero);
    }

    public static bool EsHijoMenor(Pariente pariente, DateOnly fechaCorte)
    {
        if (!EsHijo(pariente.TipoRelacion))
        {
            return false;
        }

        return pariente.FechaNacimiento > fechaCorte.AddYears(-18);
    }

    private static bool EsHijo(string tipoRelacion)
    {
        var value = tipoRelacion.Trim();
        return string.Equals(value, "H", StringComparison.OrdinalIgnoreCase)
            || string.Equals(value, "HIJO", StringComparison.OrdinalIgnoreCase)
            || string.Equals(value, "HIJA", StringComparison.OrdinalIgnoreCase);
    }
}
