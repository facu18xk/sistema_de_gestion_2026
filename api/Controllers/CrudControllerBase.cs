using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

public abstract class CrudControllerBase<TEntity, TReadDto, TUpsertDto, TId> : ControllerBase
    where TEntity : class
{
    protected readonly ICrudService<TEntity, TId> CrudService;

    protected CrudControllerBase(ICrudService<TEntity, TId> crudService)
    {
        CrudService = crudService;
    }

    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<TReadDto>>> GetAll()
    {
        var entities = await CrudService.GetAllAsync();
        return Ok(entities.Select(ToReadDto));
    }

    [HttpGet("{id:int}")]
    public virtual async Task<ActionResult<TReadDto>> GetById(TId id)
    {
        var entity = await CrudService.GetByIdAsync(id);
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
        var responseEntity = await RefreshCreatedEntityAsync(createdEntity);

        return CreatedAtAction(nameof(GetById), new { id = GetId(responseEntity) }, ToReadDto(responseEntity));
    }

    [HttpPut("{id:int}")]
    public virtual async Task<ActionResult<TReadDto>> Update(TId id, TUpsertDto dto)
    {
        try
        {
            var updatedEntity = await CrudService.UpdateAsync(id, ToEntity(dto));
            var responseEntity = await RefreshCreatedEntityAsync(updatedEntity);

            return Ok(ToReadDto(responseEntity));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public virtual async Task<IActionResult> Delete(TId id)
    {
        var entity = await CrudService.GetByIdAsync(id);
        if (entity is null)
        {
            return NotFound();
        }

        await CrudService.DeleteAsync(id);
        return NoContent();
    }

    protected virtual Task<TEntity> RefreshCreatedEntityAsync(TEntity entity)
    {
        return Task.FromResult(entity);
    }

    protected abstract TReadDto ToReadDto(TEntity entity);

    protected abstract TEntity ToEntity(TUpsertDto dto);

    protected abstract TId GetId(TEntity entity);
}
