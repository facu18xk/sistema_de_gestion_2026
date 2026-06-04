namespace api.Dtos.FacturasComprasDetalles;

public class FacturasComprasDetalleDto
{
    public int IdFacturaCompraDetalle { get; set; }
    
    public int IdFacturaCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal TotalBruto { get; set; }
    
    public decimal TotalIva { get; set; }
    
    public decimal TotalNeto { get; set; }

    public ProductoFacturaDetalleDto? Producto { get; set; }
}

public class ProductoFacturaDetalleDto
{
    public int IdProducto { get; set; }
    
    public string Descripcion { get; set; } = string.Empty; 
}

public class FacturasComprasDetalleUpsertDto
{
    public int IdFacturaCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
    
    public decimal PrecioUnitario { get; set; }
    
    public decimal TotalBruto { get; set; }
    
    public decimal TotalIva { get; set; }
    
    public decimal TotalNeto { get; set; }
}