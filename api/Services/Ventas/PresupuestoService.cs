using System.Linq.Expressions;
using api.Dtos.Common;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PresupuestoService : CrudServiceBase<Presupuesto, int>
{
    private readonly DblosAmigosContext _context;

    public PresupuestoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Presupuesto> Set => _context.Presupuestos;

    protected override IQueryable<Presupuesto> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Presupuesto> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    public override async Task<PagedResultDto<Presupuesto>> GetAllAsync(PaginationQueryDto pagination)
    {
        var page = pagination.GetNormalizedPage();
        var pageSize = pagination.GetNormalizedPageSize();
        var query = BuildQuery();
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        await UpdateEstadosByDatesAsync(items);

        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResultDto<Presupuesto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = page > 1 && totalPages > 0,
            HasNextPage = page < totalPages
        };
    }

    public override async Task<Presupuesto?> GetByIdAsync(int id)
    {
        var presupuesto = await BuildGetByIdQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (presupuesto is null)
        {
            return null;
        }

        await UpdateEstadoByDatesAsync(presupuesto);
        return presupuesto;
    }

    protected override Expression<Func<Presupuesto, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPresupuesto == id;
    }

    protected override void UpdateEntity(Presupuesto existingEntity, Presupuesto incomingEntity)
    {
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.FechaVencimiento = incomingEntity.FechaVencimiento;
    }

    private IQueryable<Presupuesto> BuildQuery()
    {
        return _context.Presupuestos
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation);
    }

    private async Task UpdateEstadosByDatesAsync(IEnumerable<Presupuesto> presupuestos)
    {
        var estadosByName = await GetEstadosByNameAsync();
        var hasChanges = false;

        foreach (var presupuesto in presupuestos)
        {
            hasChanges |= UpdateEstadoByDates(presupuesto, estadosByName);
        }

        if (hasChanges)
        {
            await _context.SaveChangesAsync();
        }
    }

    private async Task UpdateEstadoByDatesAsync(Presupuesto presupuesto)
    {
        var estadosByName = await GetEstadosByNameAsync();
        if (UpdateEstadoByDates(presupuesto, estadosByName))
        {
            await _context.SaveChangesAsync();
        }
    }

    private async Task<Dictionary<string, Estado>> GetEstadosByNameAsync()
    {
        return await _context.Estados
            .ToDictionaryAsync(estado => estado.Nombre, StringComparer.OrdinalIgnoreCase);
    }

    private static bool UpdateEstadoByDates(Presupuesto presupuesto, IReadOnlyDictionary<string, Estado> estadosByName)
    {
        if (!IsExpired(presupuesto.FechaVencimiento)
            || !estadosByName.TryGetValue("Expirado", out var estado)
            || presupuesto.IdEstado == estado.IdEstado)
        {
            return false;
        }

        presupuesto.IdEstado = estado.IdEstado;
        presupuesto.IdEstadoNavigation = estado;
        return true;
    }

    private static bool IsExpired(DateTime fechaVencimiento)
    {
        return DateTime.Today > fechaVencimiento.Date;
    }
}
