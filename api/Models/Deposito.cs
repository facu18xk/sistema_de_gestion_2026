using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Deposito
{
    public int IdDeposito { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual StocksDeposito? StocksDeposito { get; set; }
}
