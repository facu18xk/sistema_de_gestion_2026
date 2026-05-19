namespace api.Dtos.PresupuestosDetalles;

public class PresupuestosDetalleDto
{
    public int IdPresupuestoDetalle { get; set; }

    public int IdPresupuesto { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Iva { get; set; }

    public decimal Subtotal { get; set; }
}

public class PresupuestosDetalleUpsertDto
{
    public int IdPresupuesto { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Iva { get; set; }

    public decimal Subtotal { get; set; }
}
