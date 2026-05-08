using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; 

namespace api.Models;

public partial class Ciudad
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] 
    public int IdCiudad { get; set; }

    public int IdPais { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Direccion> Direcciones { get; set; } = new List<Direccion>();

    public virtual Pais? IdPaisNavigation { get; set; } 
}