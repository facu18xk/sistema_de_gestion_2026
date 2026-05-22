using System.Collections.Generic;

namespace api.Models;

public partial class TipoCuentaBancaria
{
    public int IdTipoCuentaBancaria { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<CuentaBancaria> CuentasBancarias { get; set; } = new List<CuentaBancaria>();
}
