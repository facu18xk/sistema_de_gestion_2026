using api.Dtos.Asientos;
using api.Dtos.AsientosDetalles;
using api.Dtos.Contabilidad;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AsientoContableService : IAsientoContableService
{
    private readonly DblosAmigosContext _context;

    public AsientoContableService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<AsientoCompletoDto> CreateManualAsync(AsientoCompletoUpsertDto dto)
    {
        return await CreateAsync(dto);
    }

    public async Task<AsientoCompletoDto> UpdateManualAsync(int idAsiento, AsientoCompletoUpsertDto dto)
    {
        var existing = await _context.Asientos
            .Include(item => item.AsientosDetalles)
            .FirstOrDefaultAsync(item => item.IdAsiento == idAsiento);

        if (existing is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {idAsiento}");
        }

        await ContabilidadRules.GetEnabledPeriodoAsync(_context, existing.IdPeriodoContable);

        var periodo = await ContabilidadRules.GetEnabledPeriodoByFechaAsync(_context, dto.Fecha);
        ContabilidadRules.ValidatePartidaDoble(dto.Detalles.Select(item => (item.TipoMovimiento, item.Monto)));

        foreach (var detalle in dto.Detalles)
        {
            await ContabilidadRules.ValidateCuentaAsentableAsync(
                _context,
                detalle.IdCuentaContable,
                periodo.IdProcesoContable);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        existing.NumeroAsiento = dto.NumeroAsiento <= 0 ? existing.NumeroAsiento : dto.NumeroAsiento;
        existing.IdPeriodoContable = periodo.IdPeriodoContable;
        existing.IdModulo = dto.IdModulo;
        existing.Fecha = dto.Fecha;
        existing.Descripcion = dto.Descripcion;
        existing.Automatico = dto.Automatico;
        existing.Estado = string.IsNullOrWhiteSpace(dto.Estado) ? existing.Estado : dto.Estado;
        existing.ReferenciaOrigen = dto.ReferenciaOrigen;
        existing.IdOrigen = dto.IdOrigen;
        existing.FechaMayorizacion = dto.FechaMayorizacion;

        _context.AsientosDetalles.RemoveRange(existing.AsientosDetalles);
        await _context.SaveChangesAsync();

        _context.AsientosDetalles.AddRange(dto.Detalles
            .OrderBy(item => item.Item)
            .Select(item => new AsientosDetalle
            {
                IdAsiento = existing.IdAsiento,
                IdCuentaContable = item.IdCuentaContable,
                Item = item.Item,
                TipoMovimiento = NormalizeMovimiento(item.TipoMovimiento),
                Monto = item.Monto,
                DescripcionItem = item.DescripcionItem
            }));

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var updated = await _context.Asientos
            .Include(item => item.IdPeriodoContableNavigation)
            .Include(item => item.IdModuloNavigation)
            .Include(item => item.AsientosDetalles)
            .ThenInclude(item => item.IdCuentaContableNavigation)
            .FirstAsync(item => item.IdAsiento == existing.IdAsiento);

        return ToDto(updated);
    }

    public async Task<AsientoCompletoDto> GenerateFromModeloAsync(GenerarAsientoDesdeModeloDto dto)
    {
        var modelo = await _context.ModelosAsientos
            .Include(item => item.ModelosAsientosDetalles)
            .FirstOrDefaultAsync(item => item.IdModeloAsiento == dto.IdModeloAsiento);

        if (modelo is null || !modelo.Activo)
        {
            throw new InvalidOperationException("No existe un modelo de asiento activo para generar el asiento.");
        }

        var montosPorDetalle = dto.Detalles.ToDictionary(item => item.IdModeloAsientoDetalle);
        var detalles = modelo.ModelosAsientosDetalles
            .OrderBy(item => item.Item)
            .Select(detalle =>
            {
                if (!montosPorDetalle.TryGetValue(detalle.IdModeloAsientoDetalle, out var montoDetalle))
                {
                    throw new InvalidOperationException("Debe indicar el monto para cada detalle del modelo de asiento.");
                }

                return new AsientosDetalleUpsertDto
                {
                    IdCuentaContable = detalle.IdCuentaContable,
                    Item = detalle.Item,
                    TipoMovimiento = detalle.TipoMovimiento,
                    Monto = montoDetalle.Monto,
                    DescripcionItem = montoDetalle.DescripcionItem ?? detalle.DescripcionItem
                };
            })
            .ToList();

        return await CreateAsync(new AsientoCompletoUpsertDto
        {
            NumeroAsiento = dto.NumeroAsiento,
            IdModulo = modelo.IdModulo,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion ?? modelo.Descripcion,
            Automatico = true,
            Estado = ContabilidadEstados.Registrado,
            ReferenciaOrigen = dto.ReferenciaOrigen,
            IdOrigen = dto.IdOrigen,
            Detalles = detalles
        });
    }

    private async Task<AsientoCompletoDto> CreateAsync(AsientoCompletoUpsertDto dto)
    {
        var periodo = await ContabilidadRules.GetEnabledPeriodoByFechaAsync(_context, dto.Fecha);
        ContabilidadRules.ValidatePartidaDoble(dto.Detalles.Select(item => (item.TipoMovimiento, item.Monto)));

        foreach (var detalle in dto.Detalles)
        {
            await ContabilidadRules.ValidateCuentaAsentableAsync(
                _context,
                detalle.IdCuentaContable,
                periodo.IdProcesoContable);
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var numeroAsiento = dto.NumeroAsiento;
        if (numeroAsiento <= 0)
        {
            var ultimoNumero = await _context.Asientos
                .Where(item => item.IdPeriodoContable == periodo.IdPeriodoContable)
                .Select(item => (int?)item.NumeroAsiento)
                .MaxAsync() ?? 0;
            numeroAsiento = ultimoNumero + 1;
        }

        var asiento = new Asiento
        {
            NumeroAsiento = numeroAsiento,
            IdPeriodoContable = periodo.IdPeriodoContable,
            IdModulo = dto.IdModulo,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            Automatico = dto.Automatico,
            Estado = string.IsNullOrWhiteSpace(dto.Estado) ? ContabilidadEstados.Registrado : dto.Estado,
            ReferenciaOrigen = dto.ReferenciaOrigen,
            IdOrigen = dto.IdOrigen,
            CreatedAt = dto.CreatedAt ?? DateTime.Now,
            FechaMayorizacion = dto.FechaMayorizacion
        };

        _context.Asientos.Add(asiento);
        await _context.SaveChangesAsync();

        var detalles = dto.Detalles
            .OrderBy(item => item.Item)
            .Select(item => new AsientosDetalle
            {
                IdAsiento = asiento.IdAsiento,
                IdCuentaContable = item.IdCuentaContable,
                Item = item.Item,
                TipoMovimiento = NormalizeMovimiento(item.TipoMovimiento),
                Monto = item.Monto,
                DescripcionItem = item.DescripcionItem
            })
            .ToList();

        _context.AsientosDetalles.AddRange(detalles);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var created = await _context.Asientos
            .Include(item => item.IdPeriodoContableNavigation)
            .Include(item => item.IdModuloNavigation)
            .Include(item => item.AsientosDetalles)
            .ThenInclude(item => item.IdCuentaContableNavigation)
            .FirstAsync(item => item.IdAsiento == asiento.IdAsiento);

        return ToDto(created);
    }

    private static string NormalizeMovimiento(string tipoMovimiento)
    {
        return ContabilidadRules.IsDebe(tipoMovimiento) ? "Debe" : "Haber";
    }

    private static AsientoCompletoDto ToDto(Asiento asiento)
    {
        return new AsientoCompletoDto
        {
            Asiento = new AsientoDto
            {
                IdAsiento = asiento.IdAsiento,
                NumeroAsiento = asiento.NumeroAsiento,
                IdPeriodoContable = asiento.IdPeriodoContable,
                PeriodoContable = $"{asiento.IdPeriodoContableNavigation?.Anho}/{asiento.IdPeriodoContableNavigation?.Mes}",
                IdModulo = asiento.IdModulo,
                Modulo = asiento.IdModuloNavigation?.Nombre ?? string.Empty,
                Fecha = asiento.Fecha,
                Descripcion = asiento.Descripcion,
                Automatico = asiento.Automatico,
                Estado = asiento.Estado,
                ReferenciaOrigen = asiento.ReferenciaOrigen,
                IdOrigen = asiento.IdOrigen,
                CreatedAt = asiento.CreatedAt,
                FechaMayorizacion = asiento.FechaMayorizacion
            },
            Detalles = asiento.AsientosDetalles
                .OrderBy(item => item.Item)
                .Select(item => new AsientosDetalleDto
                {
                    IdAsientoDetalle = item.IdAsientoDetalle,
                    IdAsiento = item.IdAsiento,
                    NumeroAsiento = asiento.NumeroAsiento,
                    IdCuentaContable = item.IdCuentaContable,
                    CuentaContable = item.IdCuentaContableNavigation?.Nombre ?? string.Empty,
                    Item = item.Item,
                    TipoMovimiento = item.TipoMovimiento,
                    Monto = item.Monto,
                    DescripcionItem = item.DescripcionItem
                })
                .ToList()
        };
    }
}
