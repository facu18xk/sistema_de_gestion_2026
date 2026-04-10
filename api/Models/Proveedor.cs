using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Proveedor
{
    public int IdProveedor { get; set; }

    public string Ruc { get; set; } = null!;

    public string RazonSocial { get; set; } = null!;

    public string NombreFantasia { get; set; } = null!;

    public virtual ICollection<FacturasCompra> FacturasCompras { get; set; } = new List<FacturasCompra>();

    public virtual Persona IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesCompra> OrdenesCompras { get; set; } = new List<OrdenesCompra>();

    public virtual ICollection<OrdenesPagosCompra> OrdenesPagosCompras { get; set; } = new List<OrdenesPagosCompra>();
}
