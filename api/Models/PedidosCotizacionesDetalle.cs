using System;
using System.Collections.Generic;

namespace api.Models;

public partial class PedidosCotizacionesDetalle
{
    public int IdPedidoCotizacionDetalle { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int IdProducto { get; set; }

    public string Categoria { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int Cantidad { get; set; }

    public decimal PrecioProducto { get; set; }

    public virtual PedidosCotizaciones IdPedidoCotizacionNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
