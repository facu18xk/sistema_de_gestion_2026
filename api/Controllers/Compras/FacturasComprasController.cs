using api.Dtos.FacturasCompras;
using api.Dtos.FacturasComprasDetalles; 
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq; 
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasComprasController : CrudControllerBase<FacturasCompra, FacturasCompraDto, FacturasCompraUpsertDto, int>
{
    public FacturasComprasController(ICrudService<FacturasCompra, int> facturascompraService)
        : base(facturascompraService)
    {
    }

    protected override FacturasCompraDto ToReadDto(FacturasCompra entity)
    {
        return new FacturasCompraDto
        {
            IdFacturaCompra = entity.IdFacturaCompra,
            IdOrdenCompra = entity.IdOrdenCompra,
            OrdenCompraDescripcion = entity.IdOrdenCompraNavigation?.Descripcion ?? string.Empty,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            NroComprobante = entity.NroComprobante,
            Timbrado = entity.Timbrado,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,

            Detalles = entity.FacturasComprasDetalles?
                .Select(d => new FacturasComprasDetalleDto
                {
                    IdFacturaCompraDetalle = d.IdFacturaCompraDetalle,
                    IdFacturaCompra = d.IdFacturaCompra,
                    IdProducto = d.IdProducto,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    TotalBruto = d.TotalBruto,
                    TotalIva = d.TotalIva,
                    TotalNeto = d.TotalNeto,
                    Producto = d.IdProductoNavigation is null 
                        ? null 
                        : new ProductoFacturaDetalleDto 
                        {
                            IdProducto = d.IdProductoNavigation.IdProducto,
                            Descripcion = d.IdProductoNavigation.Descripcion
                        }
                })
                .ToArray() ?? Array.Empty<FacturasComprasDetalleDto>()
        };
    }

    protected override FacturasCompra ToEntity(FacturasCompraUpsertDto dto)
    {
        return new FacturasCompra
        {
            IdOrdenCompra = dto.IdOrdenCompra,
            IdProveedor = dto.IdProveedor,
            NroComprobante = dto.NroComprobante,
            Timbrado = dto.Timbrado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            
            FacturasComprasDetalles = dto.Detalles?.Select(d => new FacturasComprasDetalle
            {
                IdProducto = d.IdProducto,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                TotalBruto = d.TotalBruto,
                TotalIva = d.TotalIva,
                TotalNeto = d.TotalNeto
            }).ToList() ?? new List<FacturasComprasDetalle>()
        };
    }

    protected override int GetId(FacturasCompra entity)
    {
        return entity.IdFacturaCompra;
    }

    protected override async Task<FacturasCompra> RefreshCreatedEntityAsync(FacturasCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaCompra) ?? entity;
    }
}