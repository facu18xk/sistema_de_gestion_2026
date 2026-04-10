using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class PresupuestosDetalle
{
    public int IdPresupuestoDetalle { get; set; }

    public int IdPresupuesto { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal Iva { get; set; }

    public decimal Subtotal { get; set; }

    public virtual Presupuesto IdPresupuestoNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
