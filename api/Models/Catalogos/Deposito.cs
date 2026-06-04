using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Deposito
{
    public int IdDeposito { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<StocksDeposito> StocksDepositos { get; set; } = new List<StocksDeposito>();
}
