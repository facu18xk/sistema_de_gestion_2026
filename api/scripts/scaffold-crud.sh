#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <EntityName> <PluralName> [IdPropertyName]" >&2
  echo "Example: $0 Producto Productos IdProducto" >&2
  exit 1
fi

entity_name="$1"
plural_name="$2"
id_property_name="${3:-Id${entity_name}}"

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

controller_file="${root_dir}/Controllers/${plural_name}Controller.cs"
service_file="${root_dir}/Services/${entity_name}Service.cs"
dto_dir="${root_dir}/Dtos/${plural_name}"
dto_file="${dto_dir}/${entity_name}Dto.cs"

mkdir -p "${dto_dir}"

if [[ -e "${controller_file}" || -e "${service_file}" || -e "${dto_file}" ]]; then
  echo "One or more target files already exist. Refusing to overwrite." >&2
  exit 1
fi

if [[ "${entity_name}" == "PedidosCotizaciones" ]]; then
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
{
    public int IdPedidoCotizacion { get; set; }

    public int IdPedidoCompra { get; set; }

    public int NumeroPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}

public class ${entity_name}UpsertDto
{
    public int IdPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<${entity_name}> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPedidoCotizacion == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.IdPedidoCompra = incomingEntity.IdPedidoCompra;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.NumeroPedido = incomingEntity.NumeroPedido;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    private IQueryable<${entity_name}> BuildQuery()
    {
        return _context.${plural_name}
            .Include(pedido => pedido.IdPedidoCompraNavigation)
            .Include(pedido => pedido.IdEstadoNavigation);
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            IdPedidoCompra = entity.IdPedidoCompra,
            NumeroPedidoCompra = entity.IdPedidoCompraNavigation?.NumeroPedido ?? 0,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            NumeroPedido = entity.NumeroPedido,
            Fecha = entity.Fecha
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            IdPedidoCompra = dto.IdPedidoCompra,
            IdEstado = dto.IdEstado,
            NumeroPedido = dto.NumeroPedido,
            Fecha = dto.Fecha
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.IdPedidoCotizacion;
    }

    protected override async Task<${entity_name}> RefreshCreatedEntityAsync(${entity_name} entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPedidoCotizacion) ?? entity;
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
elif [[ "${entity_name}" == "OrdenesCompra" ]]; then
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
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
}

public class ${entity_name}UpsertDto
{
    public int IdPedidoCotizacion { get; set; }

    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<${entity_name}> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenCompra == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.IdPedidoCotizacion = incomingEntity.IdPedidoCotizacion;
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<${entity_name}> BuildQuery()
    {
        return _context.${plural_name}
            .Include(orden => orden.IdPedidoCotizacionNavigation)
            .Include(orden => orden.IdProveedorNavigation)
            .Include(orden => orden.IdEstadoNavigation);
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            IdOrdenCompra = entity.IdOrdenCompra,
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            NumeroPedidoCotizacion = entity.IdPedidoCotizacionNavigation?.NumeroPedido ?? 0,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            IdPedidoCotizacion = dto.IdPedidoCotizacion,
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.IdOrdenCompra;
    }

    protected override async Task<${entity_name}> RefreshCreatedEntityAsync(${entity_name} entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenCompra) ?? entity;
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
elif [[ "${entity_name}" == "FacturasCompra" ]]; then
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
{
    public int IdFacturaCompra { get; set; }

    public int IdOrdenCompra { get; set; }

    public string OrdenCompraDescripcion { get; set; } = string.Empty;

    public int IdProveedor { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public string NroComprobante { get; set; } = string.Empty;

    public string Timbrado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class ${entity_name}UpsertDto
{
    public int IdOrdenCompra { get; set; }

    public int IdProveedor { get; set; }

    public string NroComprobante { get; set; } = string.Empty;

    public string Timbrado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<${entity_name}> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdFacturaCompra == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.IdOrdenCompra = incomingEntity.IdOrdenCompra;
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.NroComprobante = incomingEntity.NroComprobante;
        existingEntity.Timbrado = incomingEntity.Timbrado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<${entity_name}> BuildQuery()
    {
        return _context.${plural_name}
            .Include(factura => factura.IdOrdenCompraNavigation)
            .Include(factura => factura.IdProveedorNavigation);
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            IdFacturaCompra = entity.IdFacturaCompra,
            IdOrdenCompra = entity.IdOrdenCompra,
            OrdenCompraDescripcion = entity.IdOrdenCompraNavigation?.Descripcion ?? string.Empty,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            NroComprobante = entity.NroComprobante,
            Timbrado = entity.Timbrado,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            IdOrdenCompra = dto.IdOrdenCompra,
            IdProveedor = dto.IdProveedor,
            NroComprobante = dto.NroComprobante,
            Timbrado = dto.Timbrado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.IdFacturaCompra;
    }

    protected override async Task<${entity_name}> RefreshCreatedEntityAsync(${entity_name} entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaCompra) ?? entity;
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
elif [[ "${entity_name}" == "OrdenesPagosCompra" ]]; then
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
{
    public int IdOrdenPagoCompra { get; set; }

    public int IdProveedor { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class ${entity_name}UpsertDto
{
    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<${entity_name}> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenPagoCompra == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<${entity_name}> BuildQuery()
    {
        return _context.${plural_name}
            .Include(ordenPago => ordenPago.IdProveedorNavigation)
            .Include(ordenPago => ordenPago.IdEstadoNavigation);
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            IdOrdenPagoCompra = entity.IdOrdenPagoCompra,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.IdOrdenPagoCompra;
    }

    protected override async Task<${entity_name}> RefreshCreatedEntityAsync(${entity_name} entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenPagoCompra) ?? entity;
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
elif [[ "${entity_name}" == "Proveedor" ]]; then
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
{
    public int IdProveedor { get; set; }

    public string Ruc { get; set; } = string.Empty;

    public string RazonSocial { get; set; } = string.Empty;

    public string NombreFantasia { get; set; } = string.Empty;

    public int IdDireccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class ${entity_name}UpsertDto
{
    public string Ruc { get; set; } = string.Empty;

    public string RazonSocial { get; set; } = string.Empty;

    public string NombreFantasia { get; set; } = string.Empty;

    public int IdDireccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<${entity_name}> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdProveedor == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.RazonSocial = incomingEntity.RazonSocial;
        existingEntity.NombreFantasia = incomingEntity.NombreFantasia;

        if (incomingEntity.IdProveedorNavigation is not null)
        {
            existingEntity.IdProveedorNavigation ??= incomingEntity.IdProveedorNavigation;
            existingEntity.IdProveedorNavigation.IdDireccion = incomingEntity.IdProveedorNavigation.IdDireccion;
            existingEntity.IdProveedorNavigation.Nombres = incomingEntity.IdProveedorNavigation.Nombres;
            existingEntity.IdProveedorNavigation.Apellidos = incomingEntity.IdProveedorNavigation.Apellidos;
            existingEntity.IdProveedorNavigation.Correo = incomingEntity.IdProveedorNavigation.Correo;
            existingEntity.IdProveedorNavigation.Telefono = incomingEntity.IdProveedorNavigation.Telefono;
        }
    }

    public override async Task<${entity_name}> UpdateAsync(int id, ${entity_name} entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return existingEntity;
    }

    public override async Task DeleteAsync(int id)
    {
        var entity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        if (entity.IdProveedorNavigation is not null)
        {
            _context.Personas.Remove(entity.IdProveedorNavigation);
        }

        await _context.SaveChangesAsync();
    }

    private IQueryable<${entity_name}> BuildQuery()
    {
        return _context.${plural_name}
            .Include(proveedor => proveedor.IdProveedorNavigation);
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            IdProveedor = entity.IdProveedor,
            Ruc = entity.Ruc,
            RazonSocial = entity.RazonSocial,
            NombreFantasia = entity.NombreFantasia,
            IdDireccion = entity.IdProveedorNavigation?.IdDireccion ?? 0,
            Nombres = entity.IdProveedorNavigation?.Nombres ?? string.Empty,
            Apellidos = entity.IdProveedorNavigation?.Apellidos ?? string.Empty,
            Correo = entity.IdProveedorNavigation?.Correo ?? string.Empty,
            Telefono = entity.IdProveedorNavigation?.Telefono ?? string.Empty
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            Ruc = dto.Ruc,
            RazonSocial = dto.RazonSocial,
            NombreFantasia = dto.NombreFantasia,
            IdProveedorNavigation = new Persona
            {
                IdDireccion = dto.IdDireccion,
                Nombres = dto.Nombres,
                Apellidos = dto.Apellidos,
                Correo = dto.Correo,
                Telefono = dto.Telefono
            }
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.IdProveedor;
    }

    protected override async Task<${entity_name}> RefreshCreatedEntityAsync(${entity_name} entity)
    {
        return await CrudService.GetByIdAsync(entity.IdProveedor) ?? entity;
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
else
cat > "${dto_file}" <<EOF
namespace api.Dtos.${plural_name};

public class ${entity_name}Dto
{
    public int ${id_property_name} { get; set; }

    public string Nombre { get; set; } = string.Empty;
}

public class ${entity_name}UpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}
EOF

cat > "${service_file}" <<EOF
using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ${entity_name}Service : CrudServiceBase<${entity_name}, int>
{
    private readonly DblosAmigosContext _context;

    public ${entity_name}Service(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<${entity_name}> Set => _context.${plural_name};

    protected override IQueryable<${entity_name}> BuildReadQuery()
    {
        return _context.${plural_name}.AsNoTracking();
    }

    protected override Expression<Func<${entity_name}, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.${id_property_name} == id;
    }

    protected override void UpdateEntity(${entity_name} existingEntity, ${entity_name} incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
EOF

cat > "${controller_file}" <<EOF
using api.Dtos.${plural_name};
using api.Services;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${plural_name}Controller : CrudControllerBase<${entity_name}, ${entity_name}Dto, ${entity_name}UpsertDto, int>
{
    public ${plural_name}Controller(ICrudService<${entity_name}, int> ${entity_name,,}Service)
        : base(${entity_name,,}Service)
    {
    }

    protected override ${entity_name}Dto ToReadDto(${entity_name} entity)
    {
        return new ${entity_name}Dto
        {
            ${id_property_name} = entity.${id_property_name},
            Nombre = entity.Nombre
        };
    }

    protected override ${entity_name} ToEntity(${entity_name}UpsertDto dto)
    {
        return new ${entity_name}
        {
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(${entity_name} entity)
    {
        return entity.${id_property_name};
    }
}
EOF

echo "Created:"
echo "  ${controller_file}"
echo "  ${service_file}"
echo "  ${dto_file}"
fi
