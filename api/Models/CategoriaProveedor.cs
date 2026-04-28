using System;
using System.Collections.Generic;

namespace api.Models;

public partial class CategoriaProveedor
{
    public int ProveedorId { get; set; }

    public int CategoriaId { get; set; }

    public virtual Categoria Categoria { get; set; } = null!;

    public virtual Proveedor Proveedor { get; set; } = null!;
}
