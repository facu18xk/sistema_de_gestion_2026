using System;

namespace api.Dtos.NotasCreditosComprasDetalles;

public class NotasCreditosComprasDetalleDto
{
    public int IdNotaCreditoCompraDetalle { get; set; }
    
    public int IdNotaCreditoCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal Subtotal { get; set; }

    public ProductoNotaCreditoDetalleItemDto? Producto { get; set; }
}

public class ProductoNotaCreditoDetalleItemDto
{
    public int IdProducto { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}

public class NotasCreditosComprasDetalleUpsertDto
{
    public int IdNotaCreditoCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal Subtotal { get; set; }
}