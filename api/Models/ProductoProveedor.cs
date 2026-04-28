using System;
using System.Collections.Generic;

namespace api.Models;

public partial class ProductoProveedor
{
    public int ProductoId { get; set; }

    public int ProveedorId { get; set; }

    public string CodigoProveedor { get; set; } = null!;

    public bool Activo { get; set; }

    public virtual Producto Producto { get; set; } = null!;

    public virtual Proveedor Proveedor { get; set; } = null!;
}
