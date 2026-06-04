using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ConceptoSalarioService : CrudServiceBase<ConceptoSalario, int>
{
    private readonly DblosAmigosContext _context;

    public ConceptoSalarioService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<ConceptoSalario> Set => _context.ConceptosSalarios;

    protected override IQueryable<ConceptoSalario> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Codigo);

    protected override Expression<Func<ConceptoSalario, bool>> BuildKeyPredicate(int id) => item => item.IdConceptoSalario == id;

    public override async Task<ConceptoSalario> CreateAsync(ConceptoSalario entity)
    {
        Normalize(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<ConceptoSalario> UpdateAsync(int id, ConceptoSalario entity)
    {
        Normalize(entity);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(ConceptoSalario existingEntity, ConceptoSalario incomingEntity)
    {
        existingEntity.Codigo = incomingEntity.Codigo;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.Tipo = incomingEntity.Tipo;
        existingEntity.DeducibleIps = incomingEntity.DeducibleIps;
        existingEntity.EsSalarioBase = incomingEntity.EsSalarioBase;
        existingEntity.EsIps = incomingEntity.EsIps;
        existingEntity.EsBonificacionFamiliar = incomingEntity.EsBonificacionFamiliar;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private static void Normalize(ConceptoSalario entity)
    {
        entity.Codigo = entity.Codigo.Trim().ToUpperInvariant();
        entity.Tipo = SalarioRules.NormalizeTipo(entity.Tipo);
        if (entity.EsIps)
        {
            entity.Tipo = SalarioRules.TipoEgreso;
            entity.DeducibleIps = false;
        }
    }
}
