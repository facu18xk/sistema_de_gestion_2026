using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EmpleadoConceptoMensualService : CrudServiceBase<EmpleadoConceptoMensual, int>
{
    private readonly DblosAmigosContext _context;

    public EmpleadoConceptoMensualService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<EmpleadoConceptoMensual> Set => _context.EmpleadosConceptosMensuales;

    protected override IQueryable<EmpleadoConceptoMensual> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<EmpleadoConceptoMensual> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<EmpleadoConceptoMensual, bool>> BuildKeyPredicate(int id) => item => item.IdEmpleadoConceptoMensual == id;

    public override async Task<EmpleadoConceptoMensual> CreateAsync(EmpleadoConceptoMensual entity)
    {
        Validate(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<EmpleadoConceptoMensual> UpdateAsync(int id, EmpleadoConceptoMensual entity)
    {
        Validate(entity);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(EmpleadoConceptoMensual existingEntity, EmpleadoConceptoMensual incomingEntity)
    {
        existingEntity.IdEmpleado = incomingEntity.IdEmpleado;
        existingEntity.IdConceptoSalario = incomingEntity.IdConceptoSalario;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.FechaDesde = incomingEntity.FechaDesde;
        existingEntity.FechaHasta = incomingEntity.FechaHasta;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private static void Validate(EmpleadoConceptoMensual entity)
    {
        if (entity.Monto <= 0)
        {
            throw new InvalidOperationException("El monto debe ser mayor a cero.");
        }
    }

    private IQueryable<EmpleadoConceptoMensual> BuildQuery()
    {
        return _context.EmpleadosConceptosMensuales
            .Include(item => item.IdConceptoSalarioNavigation)
            .Include(item => item.IdEmpleadoNavigation)
                .ThenInclude(item => item.IdPersonaNavigation);
    }
}
