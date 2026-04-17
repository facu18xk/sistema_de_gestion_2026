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
using DatabaseHastaCompraVenta.Models;
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
using DatabaseHastaCompraVenta.Models;
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
