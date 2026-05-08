using System.Collections.Generic;

namespace api.Models;

public partial class CuentaContable
{
    public int IdCuentaContable { get; set; }

    public int IdProcesoContable { get; set; }

    public int? IdCuentaPadre { get; set; }

    public string NumeroCuenta { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public string TipoCuenta { get; set; } = null!;

    public bool EsAsentable { get; set; }

    public bool Activa { get; set; }

    public virtual ICollection<AsientosDetalle> AsientosDetalles { get; set; } = new List<AsientosDetalle>();

    public virtual ICollection<BalancesDetalle> BalancesDetalles { get; set; } = new List<BalancesDetalle>();

    public virtual ICollection<CuentaContable> InverseIdCuentaPadreNavigation { get; set; } = new List<CuentaContable>();

    public virtual CuentaContable? IdCuentaPadreNavigation { get; set; }

    public virtual ProcesoContable IdProcesoContableNavigation { get; set; } = null!;

    public virtual ICollection<ModelosAsientosDetalle> ModelosAsientosDetalles { get; set; } = new List<ModelosAsientosDetalle>();
}
