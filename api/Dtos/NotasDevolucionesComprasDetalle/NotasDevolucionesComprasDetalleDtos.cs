using System;

namespace api.Dtos.NotasDevolucionesComprasDetalles;

public class NotasDevolucionesComprasDetalleDto
{
    public int IdNotaDevolucionCompraDetalle { get; set; }
    
    public int IdNotaDevolucionCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal Subtotal { get; set; }

    public ProductoNotaDevolucionDetalleItemDto? Producto { get; set; }
}

public class ProductoNotaDevolucionDetalleItemDto
{
    public int IdProducto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}

public class NotasDevolucionesComprasDetalleUpsertDto
{
    public int IdNotaDevolucionCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal Subtotal { get; set; }
}