using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Categoria
{
    public int IdCategoria { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<CategoriaProveedor> CategoriasProveedores { get; set; } = new List<CategoriaProveedor>();

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
