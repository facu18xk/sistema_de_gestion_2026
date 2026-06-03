using api.Dtos.OrdenesCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq; 
using System.Threading.Tasks;
using System;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesComprasController : CrudControllerBase<OrdenesCompra, OrdenesCompraDto, OrdenesCompraUpsertDto, int>
{
    public OrdenesComprasController(ICrudService<OrdenesCompra, int> ordenescompraService)
        : base(ordenescompraService)
    {
    }

    protected override OrdenesCompraDto ToReadDto(OrdenesCompra entity)
    {
        return new OrdenesCompraDto
        {
            IdOrdenCompra = entity.IdOrdenCompra,
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            NumeroPedidoCotizacion = entity.IdPedidoCotizacionNavigation?.NumeroPedido ?? 0,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,

            Detalles = entity.OrdenesComprasDetalles?
                .Select(d => new OrdenesComprasDetalleDto
                {
                    IdOrdenCompraDetalle = d.IdOrdenCompraDetalle,
                    IdOrdenCompra = d.IdOrdenCompra,
                    IdProducto = d.IdProducto,
                    Cantidad = d.Cantidad,
                    Producto = d.IdProductoNavigation is null 
                        ? null 
                        : new ProductoOrdenCompraDetalleDto 
                        {
                            IdProducto = d.IdProductoNavigation.IdProducto,
                            Descripcion = d.IdProductoNavigation.Descripcion
                        }
                })
                .ToArray() ?? Array.Empty<OrdenesComprasDetalleDto>()
        };
    }

    protected override OrdenesCompra ToEntity(OrdenesCompraUpsertDto dto)
    {
        return new OrdenesCompra
        {
            IdPedidoCotizacion = dto.IdPedidoCotizacion,
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(OrdenesCompra entity)
    {
        return entity.IdOrdenCompra;
    }

    protected override async Task<OrdenesCompra> RefreshCreatedEntityAsync(OrdenesCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenCompra) ?? entity;
    }
}