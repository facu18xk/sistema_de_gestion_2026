using api.Dtos.AsientosDetalles;
using api.Dtos.Contabilidad;
using api.Dtos.Rrhh;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PagoSalarioService : IPagoSalarioService
{
    private readonly DblosAmigosContext _context;
    private readonly IAsientoContableService _asientoContableService;

    public PagoSalarioService(DblosAmigosContext context, IAsientoContableService asientoContableService)
    {
        _context = context;
        _asientoContableService = asientoContableService;
    }

    public async Task<List<ProcesoPagoSalarioDto>> GetProcesosAsync()
    {
        var procesos = await BuildProcesoQuery()
            .AsNoTracking()
            .OrderByDescending(item => item.PeriodoAnho)
            .ThenByDescending(item => item.PeriodoMes)
            .ToListAsync();

        return procesos.Select(ToProcesoDto).ToList();
    }

    public async Task<ProcesoPagoSalarioDto?> GetProcesoAsync(int id)
    {
        var proceso = await BuildProcesoQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == id);

        return proceso is null ? null : ToProcesoDto(proceso);
    }

    public async Task<List<PagoSalarioDetalleDto>> GetDetallesAsync(int idProcesoPagoSalario)
    {
        var exists = await _context.ProcesosPagosSalarios.AnyAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);
        if (!exists)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        var detalles = await BuildDetalleQuery()
            .AsNoTracking()
            .Where(item => item.IdProcesoPagoSalario == idProcesoPagoSalario)
            .OrderBy(item => item.IdEmpleadoNavigation.IdPersonaNavigation.Apellidos)
            .ThenBy(item => item.IdEmpleadoNavigation.IdPersonaNavigation.Nombres)
            .ThenBy(item => item.IdPagoSalarioDetalle)
            .ToListAsync();

        return detalles.Select(ToDetalleDto).ToList();
    }

    public async Task<ProcesoPagoSalarioDto> CreateProcesoAsync(ProcesoPagoSalarioUpsertDto dto)
    {
        ValidatePeriodo(dto.PeriodoAnho, dto.PeriodoMes);

        var exists = await _context.ProcesosPagosSalarios
            .AnyAsync(item => item.PeriodoAnho == dto.PeriodoAnho && item.PeriodoMes == dto.PeriodoMes);

        if (exists)
        {
            throw new InvalidOperationException("Ya existe un proceso de pago para el periodo indicado.");
        }

        var proceso = new ProcesoPagoSalario
        {
            PeriodoAnho = dto.PeriodoAnho,
            PeriodoMes = dto.PeriodoMes,
            FechaPago = dto.FechaPago,
            Estado = PagoSalarioEstados.Abierto,
            CreatedAt = DateTime.Now
        };

        _context.ProcesosPagosSalarios.Add(proceso);
        await _context.SaveChangesAsync();

        var created = await BuildProcesoQuery().FirstAsync(item => item.IdProcesoPagoSalario == proceso.IdProcesoPagoSalario);
        return ToProcesoDto(created);
    }

    public async Task<ProcesoPagoSalarioDto> GenerateAsync(int idProcesoPagoSalario)
    {
        var proceso = await BuildProcesoQuery()
            .FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);

        if (proceso is null)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        EnsureEditable(proceso);

        var parametro = await GetParametroAsync(proceso.FechaPago);
        var conceptoIps = await _context.ConceptosSalarios.FirstOrDefaultAsync(item => item.EsIps && item.Activo);
        if (conceptoIps is null)
        {
            throw new InvalidOperationException("Debe existir un concepto activo marcado como IPS.");
        }

        var conceptoBonificacion = await _context.ConceptosSalarios
            .FirstOrDefaultAsync(item => item.EsBonificacionFamiliar && item.Activo);

        var empleados = await _context.Empleados
            .Include(item => item.IdPersonaNavigation)
            .Include(item => item.Parientes)
            .Include(item => item.EmpleadosConceptosMensuales)
                .ThenInclude(item => item.IdConceptoSalarioNavigation)
            .ToListAsync();

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var automaticos = proceso.PagosSalariosDetalles
            .Where(item => item.EsAutomatico)
            .ToList();
        _context.PagosSalariosDetalles.RemoveRange(automaticos);
        await _context.SaveChangesAsync();

        var manualesPorEmpleado = await _context.PagosSalariosDetalles
            .Include(item => item.IdConceptoSalarioNavigation)
            .Where(item => item.IdProcesoPagoSalario == idProcesoPagoSalario && !item.EsAutomatico)
            .GroupBy(item => item.IdEmpleado)
            .ToDictionaryAsync(item => item.Key, item => item.ToList());

        var nuevosDetalles = new List<PagoSalarioDetalle>();

        foreach (var empleado in empleados)
        {
            var detallesEmpleado = new List<PagoSalarioDetalle>();

            var conceptosMensuales = empleado.EmpleadosConceptosMensuales
                .Where(item => IsActiveForDate(item.Activo, item.FechaDesde, item.FechaHasta, proceso.FechaPago))
                .Where(item => item.IdConceptoSalarioNavigation.Activo)
                .ToList();

            foreach (var conceptoMensual in conceptosMensuales)
            {
                var concepto = conceptoMensual.IdConceptoSalarioNavigation;
                detallesEmpleado.Add(new PagoSalarioDetalle
                {
                    IdProcesoPagoSalario = proceso.IdProcesoPagoSalario,
                    IdEmpleado = empleado.IdEmpleado,
                    IdConceptoSalario = concepto.IdConceptoSalario,
                    Tipo = SalarioRules.NormalizeTipo(concepto.Tipo),
                    Monto = conceptoMensual.Monto,
                    DeducibleIps = concepto.DeducibleIps,
                    EsAutomatico = true,
                    Observacion = "Asignacion mensual"
                });
            }

            var hijosMenores = empleado.Parientes.Count(item => SalarioRules.EsHijoMenor(item, proceso.FechaPago));
            var bonificacion = SalarioRules.CalcularBonificacionFamiliar(
                hijosMenores,
                parametro.SalarioMinimo,
                parametro.PorcentajeBonificacionFamiliar);

            if (bonificacion > 0)
            {
                if (conceptoBonificacion is null)
                {
                    throw new InvalidOperationException("Debe existir un concepto activo marcado como bonificacion familiar.");
                }

                detallesEmpleado.Add(new PagoSalarioDetalle
                {
                    IdProcesoPagoSalario = proceso.IdProcesoPagoSalario,
                    IdEmpleado = empleado.IdEmpleado,
                    IdConceptoSalario = conceptoBonificacion.IdConceptoSalario,
                    Tipo = SalarioRules.TipoIngreso,
                    Monto = bonificacion,
                    DeducibleIps = conceptoBonificacion.DeducibleIps,
                    EsAutomatico = true,
                    Observacion = $"Bonificacion familiar por {hijosMenores} hijo(s) menor(es)"
                });
            }

            var baseIps = new List<PagoSalarioDetalle>();
            if (manualesPorEmpleado.TryGetValue(empleado.IdEmpleado, out var manuales))
            {
                baseIps.AddRange(manuales);
            }

            baseIps.AddRange(detallesEmpleado);
            var ips = SalarioRules.CalcularIps(baseIps, parametro.PorcentajeIpsEmpleado);
            if (ips > 0)
            {
                detallesEmpleado.Add(new PagoSalarioDetalle
                {
                    IdProcesoPagoSalario = proceso.IdProcesoPagoSalario,
                    IdEmpleado = empleado.IdEmpleado,
                    IdConceptoSalario = conceptoIps.IdConceptoSalario,
                    Tipo = SalarioRules.TipoEgreso,
                    Monto = ips,
                    DeducibleIps = false,
                    EsAutomatico = true,
                    Observacion = $"IPS {parametro.PorcentajeIpsEmpleado:0.####}%"
                });
            }

            nuevosDetalles.AddRange(detallesEmpleado);
        }

        _context.PagosSalariosDetalles.AddRange(nuevosDetalles);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var updated = await BuildProcesoQuery().FirstAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);
        return ToProcesoDto(updated);
    }

    public async Task<PagoSalarioDetalleDto> AddDetalleAsync(int idProcesoPagoSalario, PagoSalarioDetalleUpsertDto dto)
    {
        var proceso = await _context.ProcesosPagosSalarios.FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);
        if (proceso is null)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        EnsureEditable(proceso);
        var concepto = await GetConceptoAsync(dto.IdConceptoSalario);

        var detalle = new PagoSalarioDetalle
        {
            IdProcesoPagoSalario = idProcesoPagoSalario,
            IdEmpleado = dto.IdEmpleado,
            IdConceptoSalario = dto.IdConceptoSalario,
            Tipo = SalarioRules.NormalizeTipo(concepto.Tipo),
            Monto = dto.Monto,
            DeducibleIps = concepto.DeducibleIps,
            EsAutomatico = false,
            Observacion = dto.Observacion
        };

        ValidateDetalle(detalle);
        _context.PagosSalariosDetalles.Add(detalle);
        await _context.SaveChangesAsync();

        var created = await BuildDetalleQuery().FirstAsync(item => item.IdPagoSalarioDetalle == detalle.IdPagoSalarioDetalle);
        return ToDetalleDto(created);
    }

    public async Task<PagoSalarioDetalleDto> UpdateDetalleAsync(int idProcesoPagoSalario, int idDetalle, PagoSalarioDetalleUpsertDto dto)
    {
        var detalle = await _context.PagosSalariosDetalles
            .Include(item => item.IdProcesoPagoSalarioNavigation)
            .FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario && item.IdPagoSalarioDetalle == idDetalle);

        if (detalle is null)
        {
            throw new KeyNotFoundException($"No existe el detalle con ID {idDetalle}");
        }

        EnsureEditable(detalle.IdProcesoPagoSalarioNavigation);
        var concepto = await GetConceptoAsync(dto.IdConceptoSalario);

        detalle.IdEmpleado = dto.IdEmpleado;
        detalle.IdConceptoSalario = dto.IdConceptoSalario;
        detalle.Tipo = SalarioRules.NormalizeTipo(concepto.Tipo);
        detalle.Monto = dto.Monto;
        detalle.DeducibleIps = concepto.DeducibleIps;
        detalle.Observacion = dto.Observacion;
        detalle.EsAutomatico = false;
        ValidateDetalle(detalle);

        await _context.SaveChangesAsync();

        var updated = await BuildDetalleQuery().FirstAsync(item => item.IdPagoSalarioDetalle == idDetalle);
        return ToDetalleDto(updated);
    }

    public async Task DeleteDetalleAsync(int idProcesoPagoSalario, int idDetalle)
    {
        var detalle = await _context.PagosSalariosDetalles
            .Include(item => item.IdProcesoPagoSalarioNavigation)
            .FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario && item.IdPagoSalarioDetalle == idDetalle);

        if (detalle is null)
        {
            throw new KeyNotFoundException($"No existe el detalle con ID {idDetalle}");
        }

        EnsureEditable(detalle.IdProcesoPagoSalarioNavigation);
        _context.PagosSalariosDetalles.Remove(detalle);
        await _context.SaveChangesAsync();
    }

    public async Task<ProcesoPagoSalarioDto> VerifyAsync(int idProcesoPagoSalario)
    {
        var proceso = await BuildProcesoQuery().FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);
        if (proceso is null)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        if (proceso.Estado == PagoSalarioEstados.Cerrado)
        {
            throw new InvalidOperationException("No se puede verificar un proceso cerrado.");
        }

        ValidateProcesoConDetalles(proceso);
        proceso.Estado = PagoSalarioEstados.Verificado;
        await _context.SaveChangesAsync();
        return ToProcesoDto(proceso);
    }

    public async Task<ProcesoPagoSalarioDto> CloseAsync(int idProcesoPagoSalario, CerrarProcesoPagoSalarioDto dto)
    {
        var proceso = await BuildProcesoQuery().FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);
        if (proceso is null)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        if (proceso.Estado != PagoSalarioEstados.Verificado)
        {
            throw new InvalidOperationException("El proceso debe estar verificado antes del cierre.");
        }

        ValidateProcesoConDetalles(proceso);

        var totalIngresos = TotalIngresos(proceso.PagosSalariosDetalles);
        var totalEgresos = TotalEgresos(proceso.PagosSalariosDetalles);
        var totalNeto = totalIngresos - totalEgresos;
        if (totalNeto < 0)
        {
            throw new InvalidOperationException("El neto a pagar no puede ser negativo.");
        }

        var totalIps = proceso.PagosSalariosDetalles
            .Where(item => item.Tipo == SalarioRules.TipoEgreso && item.IdConceptoSalarioNavigation.EsIps)
            .Sum(item => item.Monto);
        var otrosEgresos = totalEgresos - totalIps;

        if (totalIps > 0 && dto.IdCuentaIpsPagar is null)
        {
            throw new InvalidOperationException("Debe indicar la cuenta de IPS a pagar para cerrar el proceso.");
        }

        if (otrosEgresos > 0 && dto.IdCuentaOtrosEgresosPagar is null)
        {
            throw new InvalidOperationException("Debe indicar la cuenta de otros egresos a pagar para cerrar el proceso.");
        }

        var detallesAsiento = new List<AsientosDetalleUpsertDto>
        {
            new()
            {
                IdCuentaContable = dto.IdCuentaGastoSalarios,
                Item = 1,
                TipoMovimiento = "Debe",
                Monto = totalIngresos,
                DescripcionItem = "Sueldos y remuneraciones"
            }
        };

        var item = 2;
        if (totalIps > 0)
        {
            detallesAsiento.Add(new AsientosDetalleUpsertDto
            {
                IdCuentaContable = dto.IdCuentaIpsPagar!.Value,
                Item = item++,
                TipoMovimiento = "Haber",
                Monto = totalIps,
                DescripcionItem = "IPS a pagar"
            });
        }

        if (otrosEgresos > 0)
        {
            detallesAsiento.Add(new AsientosDetalleUpsertDto
            {
                IdCuentaContable = dto.IdCuentaOtrosEgresosPagar!.Value,
                Item = item++,
                TipoMovimiento = "Haber",
                Monto = otrosEgresos,
                DescripcionItem = "Otros egresos de salarios"
            });
        }

        if (totalNeto > 0)
        {
            detallesAsiento.Add(new AsientosDetalleUpsertDto
            {
                IdCuentaContable = dto.IdCuentaPago,
                Item = item,
                TipoMovimiento = "Haber",
                Monto = totalNeto,
                DescripcionItem = "Pago neto de salarios"
            });
        }

        var asiento = await _asientoContableService.CreateManualAsync(new AsientoCompletoUpsertDto
        {
            IdModulo = dto.IdModulo,
            Fecha = proceso.FechaPago,
            Descripcion = dto.DescripcionAsiento ?? $"Pago de salarios {proceso.PeriodoAnho}/{proceso.PeriodoMes:00}",
            Automatico = true,
            Estado = ContabilidadEstados.Registrado,
            ReferenciaOrigen = "PagoSalarios",
            IdOrigen = proceso.IdProcesoPagoSalario,
            Detalles = detallesAsiento
        });

        proceso.IdAsiento = asiento.Asiento.IdAsiento;
        proceso.Estado = PagoSalarioEstados.Cerrado;
        proceso.CerradoAt = DateTime.Now;
        await _context.SaveChangesAsync();

        return ToProcesoDto(proceso);
    }

    public async Task<List<ReciboPagoSalarioDto>> GetRecibosAsync(int idProcesoPagoSalario, int? idEmpleado = null)
    {
        var proceso = await BuildProcesoQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdProcesoPagoSalario == idProcesoPagoSalario);

        if (proceso is null)
        {
            throw new KeyNotFoundException($"No existe el proceso de pago con ID {idProcesoPagoSalario}");
        }

        if (proceso.Estado != PagoSalarioEstados.Cerrado)
        {
            throw new InvalidOperationException("Los recibos solo se emiten luego del cierre del proceso.");
        }

        var detalles = proceso.PagosSalariosDetalles.AsEnumerable();
        if (idEmpleado is not null)
        {
            detalles = detalles.Where(item => item.IdEmpleado == idEmpleado.Value);
        }

        var recibos = detalles
            .GroupBy(item => item.IdEmpleado)
            .OrderBy(group => group.First().IdEmpleadoNavigation.IdPersonaNavigation.Apellidos)
            .ThenBy(group => group.First().IdEmpleadoNavigation.IdPersonaNavigation.Nombres)
            .SelectMany(group => BuildRecibosEmpleado(proceso, group.ToList()))
            .ToList();

        return recibos;
    }

    private async Task<ParametroSalario> GetParametroAsync(DateOnly fecha)
    {
        var parametro = await _context.ParametrosSalarios
            .Where(item => item.Activo)
            .Where(item => item.FechaDesde <= fecha && (item.FechaHasta == null || item.FechaHasta >= fecha))
            .OrderByDescending(item => item.FechaDesde)
            .FirstOrDefaultAsync();

        return parametro ?? throw new InvalidOperationException("Debe configurar parametros salariales vigentes para la fecha de pago.");
    }

    private async Task<ConceptoSalario> GetConceptoAsync(int idConceptoSalario)
    {
        var concepto = await _context.ConceptosSalarios.FirstOrDefaultAsync(item => item.IdConceptoSalario == idConceptoSalario);
        if (concepto is null || !concepto.Activo)
        {
            throw new InvalidOperationException("No existe un concepto salarial activo para el detalle.");
        }

        return concepto;
    }

    private static void ValidatePeriodo(int anho, int mes)
    {
        if (anho < 2000 || mes < 1 || mes > 12)
        {
            throw new InvalidOperationException("El periodo de pago no es valido.");
        }
    }

    private static void ValidateDetalle(PagoSalarioDetalle detalle)
    {
        if (detalle.Monto <= 0)
        {
            throw new InvalidOperationException("El monto del detalle debe ser mayor a cero.");
        }
    }

    private static void EnsureEditable(ProcesoPagoSalario proceso)
    {
        if (proceso.Estado != PagoSalarioEstados.Abierto)
        {
            throw new InvalidOperationException("Solo se puede modificar un proceso abierto.");
        }
    }

    private static void ValidateProcesoConDetalles(ProcesoPagoSalario proceso)
    {
        if (!proceso.PagosSalariosDetalles.Any())
        {
            throw new InvalidOperationException("El proceso no tiene detalles de salarios.");
        }
    }

    private static bool IsActiveForDate(bool activo, DateOnly fechaDesde, DateOnly? fechaHasta, DateOnly fecha)
    {
        return activo && fechaDesde <= fecha && (fechaHasta is null || fechaHasta >= fecha);
    }

    private IQueryable<ProcesoPagoSalario> BuildProcesoQuery()
    {
        return _context.ProcesosPagosSalarios
            .Include(item => item.PagosSalariosDetalles)
                .ThenInclude(item => item.IdConceptoSalarioNavigation)
            .Include(item => item.PagosSalariosDetalles)
                .ThenInclude(item => item.IdEmpleadoNavigation)
                    .ThenInclude(item => item.IdPersonaNavigation);
    }

    private IQueryable<PagoSalarioDetalle> BuildDetalleQuery()
    {
        return _context.PagosSalariosDetalles
            .Include(item => item.IdConceptoSalarioNavigation)
            .Include(item => item.IdEmpleadoNavigation)
                .ThenInclude(item => item.IdPersonaNavigation);
    }

    private static ProcesoPagoSalarioDto ToProcesoDto(ProcesoPagoSalario proceso)
    {
        var detalles = proceso.PagosSalariosDetalles;
        return new ProcesoPagoSalarioDto
        {
            IdProcesoPagoSalario = proceso.IdProcesoPagoSalario,
            PeriodoAnho = proceso.PeriodoAnho,
            PeriodoMes = proceso.PeriodoMes,
            FechaPago = proceso.FechaPago,
            Estado = proceso.Estado,
            IdAsiento = proceso.IdAsiento,
            TotalIngresos = TotalIngresos(detalles),
            TotalEgresos = TotalEgresos(detalles),
            TotalNeto = TotalIngresos(detalles) - TotalEgresos(detalles),
            CreatedAt = proceso.CreatedAt,
            CerradoAt = proceso.CerradoAt
        };
    }

    private static PagoSalarioDetalleDto ToDetalleDto(PagoSalarioDetalle detalle)
    {
        var persona = detalle.IdEmpleadoNavigation.IdPersonaNavigation;
        return new PagoSalarioDetalleDto
        {
            IdPagoSalarioDetalle = detalle.IdPagoSalarioDetalle,
            IdProcesoPagoSalario = detalle.IdProcesoPagoSalario,
            IdEmpleado = detalle.IdEmpleado,
            Empleado = $"{persona.Nombres} {persona.Apellidos}".Trim(),
            IdConceptoSalario = detalle.IdConceptoSalario,
            ConceptoSalario = detalle.IdConceptoSalarioNavigation.Descripcion,
            Tipo = detalle.Tipo,
            Monto = detalle.Monto,
            DeducibleIps = detalle.DeducibleIps,
            EsAutomatico = detalle.EsAutomatico,
            Observacion = detalle.Observacion
        };
    }

    private static IEnumerable<ReciboPagoSalarioDto> BuildRecibosEmpleado(
        ProcesoPagoSalario proceso,
        List<PagoSalarioDetalle> detalles)
    {
        var empleado = detalles[0].IdEmpleadoNavigation;
        var persona = empleado.IdPersonaNavigation;
        var ingresos = detalles.Where(item => item.Tipo == SalarioRules.TipoIngreso).Select(ToDetalleDto).ToList();
        var egresos = detalles.Where(item => item.Tipo == SalarioRules.TipoEgreso).Select(ToDetalleDto).ToList();
        var totalIngresos = ingresos.Sum(item => item.Monto);
        var totalEgresos = egresos.Sum(item => item.Monto);

        foreach (var copia in new[] { "Original", "Duplicado" })
        {
            yield return new ReciboPagoSalarioDto
            {
                Copia = copia,
                IdProcesoPagoSalario = proceso.IdProcesoPagoSalario,
                IdEmpleado = empleado.IdEmpleado,
                Empleado = $"{persona.Nombres} {persona.Apellidos}".Trim(),
                Ci = empleado.Ci,
                Ruc = empleado.Ruc,
                PeriodoAnho = proceso.PeriodoAnho,
                PeriodoMes = proceso.PeriodoMes,
                FechaPago = proceso.FechaPago,
                Ingresos = ingresos,
                Egresos = egresos,
                TotalIngresos = totalIngresos,
                TotalEgresos = totalEgresos,
                NetoPagar = totalIngresos - totalEgresos
            };
        }
    }

    private static decimal TotalIngresos(IEnumerable<PagoSalarioDetalle> detalles)
    {
        return detalles.Where(item => item.Tipo == SalarioRules.TipoIngreso).Sum(item => item.Monto);
    }

    private static decimal TotalEgresos(IEnumerable<PagoSalarioDetalle> detalles)
    {
        return detalles.Where(item => item.Tipo == SalarioRules.TipoEgreso).Sum(item => item.Monto);
    }
}
