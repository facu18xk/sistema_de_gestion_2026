using System.Collections.Generic;

namespace api.Models;

public partial class Banco
{
    public int IdBanco { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; } = true;

    public virtual ICollection<CuentaBancaria> CuentasBancarias { get; set; } = new List<CuentaBancaria>();
}
