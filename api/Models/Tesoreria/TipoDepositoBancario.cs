using System.Collections.Generic;

namespace api.Models;

public partial class TipoDepositoBancario
{
    public int IdTipoDepositoBancario { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<DepositoBancario> DepositosBancarios { get; set; } = new List<DepositoBancario>();
}
