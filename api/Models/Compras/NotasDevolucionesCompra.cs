using System;
using System.Collections.Generic;
<<<<<<< HEAD
using System.ComponentModel.DataAnnotations.Schema;
=======
>>>>>>> front

namespace api.Models;

public partial class NotasDevolucionesCompra
{
    public int IdNotaDevolucionCompra { get; set; }

    public int IdFacturaCompra { get; set; }

<<<<<<< HEAD
    [Column("Id_Estado")]
    public int IdEstado { get; set; }

=======
>>>>>>> front
    public string Motivo { get; set; } = null!;

    public DateTime Fecha { get; set; }

<<<<<<< HEAD
    [ForeignKey("IdEstado")]
    public virtual Estado IdEstadoNavigation { get; set; } = null!;

=======
>>>>>>> front
    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosCompra> NotasCreditosCompras { get; set; } = new List<NotasCreditosCompra>();

    public virtual ICollection<NotasDevolucionesComprasDetalle> NotasDevolucionesComprasDetalles { get; set; } = new List<NotasDevolucionesComprasDetalle>();
}
