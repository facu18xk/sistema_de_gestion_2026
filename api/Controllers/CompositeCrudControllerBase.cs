using api.Dtos.Common;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

public abstract class CompositeCrudControllerBase<TEntity, TReadDto, TUpsertDto, TKey1, TKey2> : ControllerBase
    where TEntity : class
{
    protected readonly ICompositeCrudService<TEntity, TKey1, TKey2> CrudService;

    protected CompositeCrudControllerBase(ICompositeCrudService<TEntity, TKey1, TKey2> crudService)
    {
        CrudService = crudService;
    }

    [HttpGet]
    public virtual async Task<ActionResult<PagedResultDto<TReadDto>>> GetAll([FromQuery] PaginationQueryDto pagination)
    {
        var result = await CrudService.GetAllAsync(pagination);

        return Ok(new PagedResultDto<TReadDto>
        {
            Items = result.Items.Select(ToReadDto).ToArray(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages,
            HasPreviousPage = result.HasPreviousPage,
            HasNextPage = result.HasNextPage
        });
    }

    [HttpGet("{key1}/{key2}")]
    public virtual async Task<ActionResult<TReadDto>> GetById(TKey1 key1, TKey2 key2)
    {
        var entity = await CrudService.GetByIdAsync(key1, key2);
        if (entity is null)
        {
            return NotFound();
        }

        return Ok(ToReadDto(entity));
    }

    [HttpPost]
    public virtual async Task<ActionResult<TReadDto>> Create(TUpsertDto dto)
    {
        var createdEntity = await CrudService.CreateAsync(ToEntity(dto));
        return CreatedAtAction(nameof(GetById), GetRouteValues(createdEntity), ToReadDto(createdEntity));
    }

    [HttpPut("{key1}/{key2}")]
    public virtual async Task<ActionResult<TReadDto>> Update(TKey1 key1, TKey2 key2, TUpsertDto dto)
    {
        try
        {
            var updatedEntity = await CrudService.UpdateAsync(key1, key2, ToEntity(dto));
            return Ok(ToReadDto(updatedEntity));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{key1}/{key2}")]
    public virtual async Task<IActionResult> Delete(TKey1 key1, TKey2 key2)
    {
        var entity = await CrudService.GetByIdAsync(key1, key2);
        if (entity is null)
        {
            return NotFound();
        }

        await CrudService.DeleteAsync(key1, key2);
        return NoContent();
    }

    protected abstract TReadDto ToReadDto(TEntity entity);

    protected abstract TEntity ToEntity(TUpsertDto dto);

    protected abstract object GetRouteValues(TEntity entity);
}
