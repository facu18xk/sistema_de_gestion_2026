using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ParametroSalarioService : CrudServiceBase<ParametroSalario, int>
{
    private readonly DblosAmigosContext _context;

    public ParametroSalarioService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<ParametroSalario> Set => _context.ParametrosSalarios;

    protected override IQueryable<ParametroSalario> BuildReadQuery() => Set.AsNoTracking().OrderByDescending(item => item.FechaDesde);

    protected override Expression<Func<ParametroSalario, bool>> BuildKeyPredicate(int id) => item => item.IdParametroSalario == id;

    public override async Task<ParametroSalario> CreateAsync(ParametroSalario entity)
    {
        Validate(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<ParametroSalario> UpdateAsync(int id, ParametroSalario entity)
    {
        Validate(entity);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(ParametroSalario existingEntity, ParametroSalario incomingEntity)
    {
        existingEntity.FechaDesde = incomingEntity.FechaDesde;
        existingEntity.FechaHasta = incomingEntity.FechaHasta;
        existingEntity.SalarioMinimo = incomingEntity.SalarioMinimo;
        existingEntity.PorcentajeIpsEmpleado = incomingEntity.PorcentajeIpsEmpleado;
        existingEntity.PorcentajeBonificacionFamiliar = incomingEntity.PorcentajeBonificacionFamiliar;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private static void Validate(ParametroSalario entity)
    {
        if (entity.SalarioMinimo <= 0)
        {
            throw new InvalidOperationException("El salario minimo debe ser mayor a cero.");
        }

        if (entity.PorcentajeIpsEmpleado < 0 || entity.PorcentajeBonificacionFamiliar < 0)
        {
            throw new InvalidOperationException("Los porcentajes no pueden ser negativos.");
        }
    }
}
