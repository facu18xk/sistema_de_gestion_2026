using System;
using System.Collections.Generic;

namespace api.Dtos.OrdenesCompras;

public class OrdenesCompraDto
{
    public int IdOrdenCompra { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int NumeroPedidoCotizacion { get; set; }

    public int IdProveedor { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public IReadOnlyCollection<OrdenesComprasDetalleDto> Detalles { get; set; } = Array.Empty<OrdenesComprasDetalleDto>();
}

public class OrdenesCompraUpsertDto
{
    public int IdPedidoCotizacion { get; set; }

    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class OrdenesComprasDetalleDto
{
    public int IdOrdenCompraDetalle { get; set; }
    
    public int IdOrdenCompra { get; set; }
    
    public int IdProducto { get; set; }
    
    public int Cantidad { get; set; }

    public ProductoOrdenCompraDetalleDto? Producto { get; set; }
}

public class ProductoOrdenCompraDetalleDto
{
    public int IdProducto { get; set; }
    
    public string Descripcion { get; set; } = string.Empty;
}