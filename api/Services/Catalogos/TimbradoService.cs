using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TimbradoService : CrudServiceBase<Timbrado, int>
{
    private readonly DblosAmigosContext _context;

    public TimbradoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Timbrado> Set => _context.Timbrados;

    protected override IQueryable<Timbrado> BuildReadQuery()
    {
        return _context.Timbrados.AsNoTracking();
    }

    protected override IQueryable<Timbrado> BuildGetByIdQuery()
    {
        return _context.Timbrados.AsNoTracking();
    }

    protected override Expression<Func<Timbrado, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdTimbrado == id;
    }

    protected override void UpdateEntity(Timbrado existingEntity, Timbrado incomingEntity)
    {
        existingEntity.NumeroTimbrado = incomingEntity.NumeroTimbrado;
        existingEntity.FechaInicio = incomingEntity.FechaInicio;
        existingEntity.FechaFinal = incomingEntity.FechaFinal;
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.Establecimiento = incomingEntity.Establecimiento;
        existingEntity.PuntoExpedicion = incomingEntity.PuntoExpedicion;
        existingEntity.NumeroInicial = incomingEntity.NumeroInicial;
        existingEntity.NumeroFinal = incomingEntity.NumeroFinal;
        existingEntity.UltimoNumeroUsado = incomingEntity.UltimoNumeroUsado;
        existingEntity.TipoComprobante = incomingEntity.TipoComprobante;
        existingEntity.Activo = incomingEntity.Activo;
    }
}
