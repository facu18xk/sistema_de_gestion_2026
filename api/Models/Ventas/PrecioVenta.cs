using System;

namespace api.Models;

public partial class PrecioVenta
{
    public int IdPrecioVenta { get; set; }

    public int IdProducto { get; set; }

    public decimal PrecioCompraBase { get; set; }

    public decimal PorcentajeGanancia { get; set; }

    public decimal PrecioVentaValor { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaDesde { get; set; }

    public DateTime? FechaHasta { get; set; }

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
