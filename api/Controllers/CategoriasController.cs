using api.Dtos.Categorias;
using api.Services;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : CrudControllerBase<Categoria, CategoriaDto, CategoriaUpsertDto, int>
{
    public CategoriasController(ICrudService<Categoria, int> categoriaService)
        : base(categoriaService)
    {
    }

    protected override CategoriaDto ToReadDto(Categoria entity)
    {
        return new CategoriaDto
        {
            IdCategoria = entity.IdCategoria,
            Nombre = entity.Nombre
        };
    }

    protected override Categoria ToEntity(CategoriaUpsertDto dto)
    {
        return new Categoria
        {
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Categoria entity)
    {
        return entity.IdCategoria;
    }
}
