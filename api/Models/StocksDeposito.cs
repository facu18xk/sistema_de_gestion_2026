using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class StocksDeposito
{
    public int IdDeposito { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public virtual Deposito IdDepositoNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
