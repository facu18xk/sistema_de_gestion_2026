using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace api.Models;

public partial class Producto
{
    public int IdProducto { get; set; }

    public int IdMarca { get; set; }

    public int IdCategoria { get; set; }

    public string Descripcion { get; set; } = null!;

    public decimal PrecioUnitario { get; set; }

    public bool EsServicio { get; set; }

    public decimal PorcentajeIva { get; set; }

    [NotMapped]
    public int CantidadTotal => StocksDepositos.Sum(stock => stock.Cantidad);

    public virtual ICollection<FacturasComprasDetalle> FacturasComprasDetalles { get; set; } = new List<FacturasComprasDetalle>();

    public virtual ICollection<FacturasVentasDetalle> FacturasVentasDetalles { get; set; } = new List<FacturasVentasDetalle>();

    public virtual Categoria IdCategoriaNavigation { get; set; } = null!;

    public virtual Marca IdMarcaNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosComprasDetalle> NotasCreditosComprasDetalles { get; set; } = new List<NotasCreditosComprasDetalle>();

    public virtual ICollection<NotasCreditosVentasDetalle> NotasCreditosVentasDetalles { get; set; } = new List<NotasCreditosVentasDetalle>();

    public virtual ICollection<NotasDevolucionesComprasDetalle> NotasDevolucionesComprasDetalles { get; set; } = new List<NotasDevolucionesComprasDetalle>();

    public virtual ICollection<NotasDevolucionesVentasDetalle> NotasDevolucionesVentasDetalles { get; set; } = new List<NotasDevolucionesVentasDetalle>();

    public virtual ICollection<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; } = new List<OrdenesComprasDetalle>();

    public virtual ICollection<OrdenesVentasDetalle> OrdenesVentasDetalles { get; set; } = new List<OrdenesVentasDetalle>();

    public virtual ICollection<PedidosComprasDetalle> PedidosComprasDetalles { get; set; } = new List<PedidosComprasDetalle>();

    public virtual ICollection<PedidosCotizacionesDetalle> PedidosCotizacionesDetalles { get; set; } = new List<PedidosCotizacionesDetalle>();

    public virtual ICollection<PresupuestosDetalle> PresupuestosDetalles { get; set; } = new List<PresupuestosDetalle>();

    public virtual ICollection<StocksDeposito> StocksDepositos { get; set; } = new List<StocksDeposito>();
}
