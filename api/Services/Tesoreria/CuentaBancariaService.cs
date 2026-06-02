using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CuentaBancariaService : CrudServiceBase<CuentaBancaria, int>
{
    private readonly DblosAmigosContext _context;

    public CuentaBancariaService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<CuentaBancaria> Set => _context.CuentasBancarias;

    protected override IQueryable<CuentaBancaria> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<CuentaBancaria> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<CuentaBancaria, bool>> BuildKeyPredicate(int id) => item => item.IdCuentaBancaria == id;

    protected override void UpdateEntity(CuentaBancaria existingEntity, CuentaBancaria incomingEntity)
    {
        existingEntity.IdBanco = incomingEntity.IdBanco;
        existingEntity.IdTipoCuentaBancaria = incomingEntity.IdTipoCuentaBancaria;
        existingEntity.IdCuentaContable = incomingEntity.IdCuentaContable;
        existingEntity.NumeroCuenta = incomingEntity.NumeroCuenta;
        existingEntity.Moneda = incomingEntity.Moneda;
        existingEntity.Saldo = incomingEntity.Saldo;
        existingEntity.SaldoDisponible = incomingEntity.SaldoDisponible;
        existingEntity.Activa = incomingEntity.Activa;
    }

    private IQueryable<CuentaBancaria> BuildQuery()
    {
        return _context.CuentasBancarias
            .Include(item => item.IdBancoNavigation)
            .Include(item => item.IdTipoCuentaBancariaNavigation)
            .Include(item => item.IdCuentaContableNavigation)
            .OrderBy(item => item.IdBancoNavigation.Nombre)
            .ThenBy(item => item.NumeroCuenta);
    }
}
