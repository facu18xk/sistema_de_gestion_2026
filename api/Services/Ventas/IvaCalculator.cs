namespace api.Services;

internal static class IvaCalculator
{
    public static decimal CalculateTotal(decimal totalBruto, decimal porcentajeIva)
    {
        return Math.Round(totalBruto * NormalizeRate(porcentajeIva), 2, MidpointRounding.AwayFromZero);
    }

    private static decimal NormalizeRate(decimal porcentajeIva)
    {
        return porcentajeIva > 1 ? porcentajeIva / 100 : porcentajeIva;
    }
}
