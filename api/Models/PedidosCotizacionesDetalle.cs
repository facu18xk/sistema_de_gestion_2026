using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class PedidosCotizacionesDetalle
{
    public int IdPedidoCotizacionDetalle { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int IdProducto { get; set; }

    public string Categoria { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int Cantidad { get; set; }

    public decimal PrecioProducto { get; set; }

    public virtual PedidosCotizacion IdPedidoCotizacionNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
