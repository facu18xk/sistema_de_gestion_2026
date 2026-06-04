namespace api.Services;

public static class PrecioVentaCalculator
{
    public static decimal Calcular(decimal precioCompraBase, decimal porcentajeGanancia)
    {
        var precioVenta = precioCompraBase * (1 + porcentajeGanancia / 100);
        return Math.Round(precioVenta, 2, MidpointRounding.AwayFromZero);
    }
}
