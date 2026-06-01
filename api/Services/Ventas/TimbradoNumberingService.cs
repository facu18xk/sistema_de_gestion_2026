using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TimbradoNumberingService
{
    private const string FacturaTipoComprobante = "Factura";
    private const string NotaCreditoVentaTipoComprobante = "NotaCreditoVenta";
    private readonly DblosAmigosContext _context;

    public TimbradoNumberingService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task ApplyNextFacturaVentaNumberAsync(FacturasVenta facturaVenta)
    {
        if (!string.IsNullOrWhiteSpace(facturaVenta.NroComprobante))
        {
            if (facturaVenta.IdTimbrado == 0)
            {
                facturaVenta.IdTimbrado = (await GetActiveTimbradoAsync(
                    facturaVenta.Fecha,
                    FacturaTipoComprobante,
                    "facturas",
                    "emitir facturas")).IdTimbrado;
            }

            facturaVenta.NroComprobante = facturaVenta.NroComprobante.Trim();
            return;
        }

        var timbrado = await GetActiveTimbradoAsync(
            facturaVenta.Fecha,
            FacturaTipoComprobante,
            "facturas",
            "emitir facturas");
        ApplyNextNumber(facturaVenta, timbrado);
    }

    public async Task ApplyNextNotaCreditoVentaNumberAsync(NotasCreditosVenta notaCreditoVenta)
    {
        if (!string.IsNullOrWhiteSpace(notaCreditoVenta.NroComprobante))
        {
            if (notaCreditoVenta.IdTimbrado == 0)
            {
                notaCreditoVenta.IdTimbrado = (await GetActiveTimbradoAsync(
                    notaCreditoVenta.FechaEmision,
                    NotaCreditoVentaTipoComprobante,
                    "notas de credito de venta",
                    "emitir notas de credito de venta")).IdTimbrado;
            }

            notaCreditoVenta.NroComprobante = notaCreditoVenta.NroComprobante.Trim();
            return;
        }

        var timbrado = await GetActiveTimbradoAsync(
            notaCreditoVenta.FechaEmision,
            NotaCreditoVentaTipoComprobante,
            "notas de credito de venta",
            "emitir notas de credito de venta");
        ApplyNextNumber(notaCreditoVenta, timbrado);
    }

    private static void ApplyNextNumber(FacturasVenta facturaVenta, Timbrado timbrado)
    {
        var nextNumber = Math.Max(timbrado.UltimoNumeroUsado + 1, timbrado.NumeroInicial);
        if (nextNumber > timbrado.NumeroFinal)
        {
            throw new InvalidOperationException("El rango del timbrado activo está agotado.");
        }

        timbrado.UltimoNumeroUsado = nextNumber;
        facturaVenta.IdTimbrado = timbrado.IdTimbrado;
        facturaVenta.NroComprobante = FormatNumeroComprobante(timbrado, nextNumber);
    }

    private static void ApplyNextNumber(NotasCreditosVenta notaCreditoVenta, Timbrado timbrado)
    {
        var nextNumber = Math.Max(timbrado.UltimoNumeroUsado + 1, timbrado.NumeroInicial);
        if (nextNumber > timbrado.NumeroFinal)
        {
            throw new InvalidOperationException("El rango del timbrado activo está agotado.");
        }

        timbrado.UltimoNumeroUsado = nextNumber;
        notaCreditoVenta.IdTimbrado = timbrado.IdTimbrado;
        notaCreditoVenta.NroComprobante = FormatNumeroComprobante(timbrado, nextNumber);
    }

    private async Task<Timbrado> GetActiveTimbradoAsync(
        DateTime comprobanteFecha,
        string tipoComprobante,
        string duplicateDocumentName,
        string emitDocumentName)
    {
        var fecha = DateOnly.FromDateTime(comprobanteFecha);
        var timbrados = await _context.Timbrados
            .FromSqlInterpolated($"""
                SELECT *
                FROM "Timbrados"
                WHERE "Activo" = TRUE
                  AND "Tipo_Comprobante" = {tipoComprobante}
                  AND "Fecha_Inicio" <= {fecha}
                  AND "Fecha_Final" >= {fecha}
                FOR UPDATE
                """)
            .ToListAsync();

        if (timbrados.Count == 0)
        {
            throw new InvalidOperationException($"No existe un timbrado activo y vigente para {emitDocumentName} en la fecha indicada.");
        }

        if (timbrados.Count > 1)
        {
            throw new InvalidOperationException($"Existe más de un timbrado activo y vigente para {duplicateDocumentName} en la fecha indicada.");
        }

        return timbrados[0];
    }

    private static string FormatNumeroComprobante(Timbrado timbrado, int number)
    {
        return $"{timbrado.Establecimiento}-{timbrado.PuntoExpedicion}-{number:0000000}";
    }
}
