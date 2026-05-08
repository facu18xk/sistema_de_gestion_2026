using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CuentaContableService : CrudServiceBase<CuentaContable, int>
{
    private readonly DblosAmigosContext _context;

    public CuentaContableService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<CuentaContable> Set => _context.CuentasContables;

    protected override IQueryable<CuentaContable> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<CuentaContable> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<CuentaContable, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdCuentaContable == id;
    }

    public override async Task<CuentaContable> CreateAsync(CuentaContable entity)
    {
        await ValidateCuentaAsync(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<CuentaContable> UpdateAsync(int id, CuentaContable entity)
    {
        await ValidateCuentaAsync(entity, id);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(CuentaContable existingEntity, CuentaContable incomingEntity)
    {
        existingEntity.IdProcesoContable = incomingEntity.IdProcesoContable;
        existingEntity.IdCuentaPadre = incomingEntity.IdCuentaPadre;
        existingEntity.NumeroCuenta = incomingEntity.NumeroCuenta;
        existingEntity.Nombre = incomingEntity.Nombre;
        existingEntity.TipoCuenta = incomingEntity.TipoCuenta;
        existingEntity.EsAsentable = incomingEntity.EsAsentable;
        existingEntity.Activa = incomingEntity.Activa;
    }

    private IQueryable<CuentaContable> BuildQuery()
    {
        return _context.CuentasContables
            .Include(cuenta => cuenta.IdProcesoContableNavigation)
            .Include(cuenta => cuenta.IdCuentaPadreNavigation);
    }

    private async Task ValidateCuentaAsync(CuentaContable entity, int? updatingId = null)
    {
        var proceso = await _context.ProcesosContables
            .FirstOrDefaultAsync(item => item.IdProcesoContable == entity.IdProcesoContable);

        if (proceso is null)
        {
            throw new InvalidOperationException("No existe el proceso contable indicado.");
        }

        if (!ContabilidadRules.IsEnabled(proceso.Estado))
        {
            throw new InvalidOperationException("El proceso contable no se encuentra habilitado.");
        }

        if (entity.IdCuentaPadre == updatingId)
        {
            throw new InvalidOperationException("Una cuenta contable no puede ser padre de sí misma.");
        }

        var nivel = 1;
        if (entity.IdCuentaPadre is not null)
        {
            var parent = await _context.CuentasContables
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.IdCuentaContable == entity.IdCuentaPadre);

            if (parent is null)
            {
                throw new InvalidOperationException("No existe la cuenta padre indicada.");
            }

            if (parent.IdProcesoContable != entity.IdProcesoContable)
            {
                throw new InvalidOperationException("La cuenta padre debe pertenecer al mismo proceso contable.");
            }

            nivel = await GetNivelAsync(parent) + 1;
        }

        if (proceso.CantNiveles is not null && nivel > proceso.CantNiveles)
        {
            throw new InvalidOperationException("La cuenta supera la cantidad de niveles definida para el proceso contable.");
        }

        if (proceso.CantDigitosNivel is not null && entity.NumeroCuenta.Length > nivel * proceso.CantDigitosNivel)
        {
            throw new InvalidOperationException("El número de cuenta supera la cantidad de dígitos permitida para su nivel.");
        }
    }

    private async Task<int> GetNivelAsync(CuentaContable cuenta)
    {
        var nivel = 1;
        var idPadre = cuenta.IdCuentaPadre;

        while (idPadre is not null)
        {
            var parent = await _context.CuentasContables
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.IdCuentaContable == idPadre);

            if (parent is null)
            {
                break;
            }

            nivel++;
            idPadre = parent.IdCuentaPadre;
        }

        return nivel;
    }
}
