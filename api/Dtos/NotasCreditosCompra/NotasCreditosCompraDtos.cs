using System;
using System.Collections.Generic;

namespace api.Dtos.NotasCreditosCompras;

public class NotasCreditosCompraDto
{
    public int IdNotaCreditoCompra { get; set; }

    public int IdFacturaCompra { get; set; }

    public string NroComprobanteFactura { get; set; } = string.Empty;

    public int IdNotaDevolucionCompra { get; set; }

    public string Timbrado { get; set; } = string.Empty;

    public string Motivo { get; set; } = string.Empty;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }

    public IReadOnlyCollection<NotasCreditosComprasDetalleDto> Detalles { get; set; } = Array.Empty<NotasCreditosComprasDetalleDto>();
}

public class NotasCreditosCompraUpsertDto
{
    public int IdFacturaCompra { get; set; }

    public int IdNotaDevolucionCompra { get; set; }

    public string Timbrado { get; set; } = string.Empty;

    public string Motivo { get; set; } = string.Empty;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }

    public IReadOnlyCollection<api.Dtos.NotasCreditosComprasDetalles.NotasCreditosComprasDetalleUpsertDto> Detalles { get; set; } = Array.Empty<api.Dtos.NotasCreditosComprasDetalles.NotasCreditosComprasDetalleUpsertDto>();
}
public class NotasCreditosComprasDetalleDto
{
    public int IdNotaCreditoCompraDetalle { get; set; }
    public int IdNotaCreditoCompra { get; set; }
    public int IdProducto { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    
    public ProductoNotaCreditoDetalleDto? Producto { get; set; }
}

public class ProductoNotaCreditoDetalleDto
{
    public int IdProducto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}