namespace api.Dtos.OrdenesComprasDetalles;

public class OrdenesComprasDetalleDto
{
    public int IdOrdenCompraDetalle { get; set; }
    
    public int IdOrdenCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }

    public ProductoDetalleDto? Producto { get; set; }
}

public class ProductoDetalleDto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class OrdenesComprasDetalleUpsertDto
{
    public int IdOrdenCompraDetalle { get; set; }
    
    public int IdOrdenCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }
}