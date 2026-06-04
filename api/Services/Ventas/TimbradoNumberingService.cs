using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TimbradoNumberingService
{
    private const string FacturaTipoComprobante = "Factura";
    private readonly DblosAmigosContext _context;

    public TimbradoNumberingService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task ApplyNextFacturaVentaNumberAsync(FacturasVenta facturaVenta)
    {
        var fecha = DateOnly.FromDateTime(facturaVenta.Fecha);
        var timbrados = await _context.Timbrados
            .FromSqlInterpolated($"""
                SELECT *
                FROM "Timbrados"
                WHERE "Activo" = TRUE
                  AND "Tipo_Comprobante" = {FacturaTipoComprobante}
                  AND "Fecha_Inicio" <= {fecha}
                  AND "Fecha_Final" >= {fecha}
                FOR UPDATE
                """)
            .ToListAsync();

        if (timbrados.Count == 0)
        {
            throw new InvalidOperationException("No existe un timbrado activo y vigente para emitir facturas en la fecha indicada.");
        }

        if (timbrados.Count > 1)
        {
            throw new InvalidOperationException("Existe más de un timbrado activo y vigente para facturas en la fecha indicada.");
        }

        var timbrado = timbrados[0];
        var nextNumber = Math.Max(timbrado.UltimoNumeroUsado + 1, timbrado.NumeroInicial);
        if (nextNumber > timbrado.NumeroFinal)
        {
            throw new InvalidOperationException("El rango del timbrado activo está agotado.");
        }

        timbrado.UltimoNumeroUsado = nextNumber;
        facturaVenta.IdTimbrado = timbrado.IdTimbrado;
        facturaVenta.NroComprobante = FormatNumeroComprobante(timbrado, nextNumber);
    }

    private static string FormatNumeroComprobante(Timbrado timbrado, int number)
    {
        return $"{timbrado.Establecimiento}-{timbrado.PuntoExpedicion}-{number:0000000}";
    }
}
