using System;
using System.Collections.Generic;

namespace api.Dtos.NotasDevolucionesCompras;

public class NotasDevolucionesCompraDto
{
    public int IdNotaDevolucionCompra { get; set; }

    public int IdFacturaCompra { get; set; }
    
    public string NroComprobanteFactura { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public string Motivo { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public IReadOnlyCollection<NotasDevolucionesComprasDetalleDto> Detalles { get; set; } = Array.Empty<NotasDevolucionesComprasDetalleDto>();
}

public class NotasDevolucionesCompraUpsertDto
{
    public int IdFacturaCompra { get; set; }

    public int IdEstado { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

public IReadOnlyCollection<NotasDevolucionesComprasDetalleDto> Detalles { get; set; } = Array.Empty<NotasDevolucionesComprasDetalleDto>();
}

public class NotasDevolucionesComprasDetalleDto
{
    public int IdNotaDevolucionCompraDetalle { get; set; }
    public int IdNotaDevolucionCompra { get; set; }
    public int IdProducto { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    
    public ProductoNotaDevolucionDetalleDto? Producto { get; set; }
}

public class ProductoNotaDevolucionDetalleDto
{
    public int IdProducto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}