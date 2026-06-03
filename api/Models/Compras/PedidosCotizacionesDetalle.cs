using System;
using System.Collections.Generic;
<<<<<<< HEAD
using System.ComponentModel.DataAnnotations.Schema; 
=======
>>>>>>> front

namespace api.Models;

public partial class PedidosCotizacionesDetalle
{
    public int IdPedidoCotizacionDetalle { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int IdProducto { get; set; }

    public int IdCategoria { get; set; }

    public string Descripcion { get; set; } = null!;

    public int Cantidad { get; set; }

    public decimal PrecioProducto { get; set; }

<<<<<<< HEAD
    [Column("Descuento")]
    public decimal Descuento { get; set; }

=======
>>>>>>> front
    public virtual PedidosCotizaciones IdPedidoCotizacionNavigation { get; set; } = null!;

    public virtual Categoria IdCategoriaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
<<<<<<< HEAD
}
=======
}
>>>>>>> front
