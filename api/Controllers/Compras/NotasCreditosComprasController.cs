using api.Dtos.NotasCreditosCompras;
using api.Dtos.NotasCreditosComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

using ReadDetalleDto = api.Dtos.NotasCreditosCompras.NotasCreditosComprasDetalleDto;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasCreditosComprasController : CrudControllerBase<NotasCreditosCompra, NotasCreditosCompraDto, NotasCreditosCompraUpsertDto, int>
{
    public NotasCreditosComprasController(ICrudService<NotasCreditosCompra, int> service)
        : base(service)
    {
    }

    protected override NotasCreditosCompraDto ToReadDto(NotasCreditosCompra entity)
    {
        return new NotasCreditosCompraDto
        {
            IdNotaCreditoCompra = entity.IdNotaCreditoCompra,
            IdFacturaCompra = entity.IdFacturaCompra,
            NroComprobanteFactura = entity.IdFacturaCompraNavigation?.NroComprobante ?? string.Empty,
            IdNotaDevolucionCompra = entity.IdNotaDevolucionCompra,
            Timbrado = entity.Timbrado,
            Motivo = entity.Motivo,
            FechaEmision = entity.FechaEmision,
            Total = entity.Total,
            Detalles = entity.NotasCreditosComprasDetalles?
                .Select(d => new ReadDetalleDto 
                {
                    IdNotaCreditoCompraDetalle = d.IdNotaCreditoCompraDetalle,
                    IdNotaCreditoCompra = d.IdNotaCreditoCompra,
                    IdProducto = d.IdProducto,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal,
                    Producto = d.IdProductoNavigation is null 
                        ? null 
                        : new api.Dtos.NotasCreditosCompras.ProductoNotaCreditoDetalleDto 
                        {
                            IdProducto = d.IdProductoNavigation.IdProducto,
                            Descripcion = d.IdProductoNavigation.Descripcion
                        }
                })
                .ToArray() ?? Array.Empty<ReadDetalleDto>() 
        };
    }

    protected override NotasCreditosCompra ToEntity(NotasCreditosCompraUpsertDto dto)
    {
        return new NotasCreditosCompra
        {
            IdFacturaCompra = dto.IdFacturaCompra,
            IdNotaDevolucionCompra = dto.IdNotaDevolucionCompra,
            Timbrado = dto.Timbrado,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Total = dto.Total,
            
            NotasCreditosComprasDetalles = dto.Detalles?.Select(d => new NotasCreditosComprasDetalle
            {
                IdProducto = d.IdProducto,
                Cantidad = d.Cantidad, 
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            }).ToList() ?? new List<NotasCreditosComprasDetalle>()
        };
    }

    protected override int GetId(NotasCreditosCompra entity)
    {
        return entity.IdNotaCreditoCompra;
    }

    protected override async Task<NotasCreditosCompra> RefreshCreatedEntityAsync(NotasCreditosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaCreditoCompra) ?? entity;
    }
}