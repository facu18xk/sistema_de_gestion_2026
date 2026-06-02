using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class DetalleDepositoBancarioService : CrudServiceBase<DetalleDepositoBancario, int>
{
    private readonly DblosAmigosContext _context;

    public DetalleDepositoBancarioService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<DetalleDepositoBancario> Set => _context.DetallesDepositosBancarios;

    protected override IQueryable<DetalleDepositoBancario> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.IdDetalleDepositoBancario);

    protected override Expression<Func<DetalleDepositoBancario, bool>> BuildKeyPredicate(int id) => item => item.IdDetalleDepositoBancario == id;

    protected override void UpdateEntity(DetalleDepositoBancario existingEntity, DetalleDepositoBancario incomingEntity)
    {
        existingEntity.IdDepositoBancario = incomingEntity.IdDepositoBancario;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }
}
