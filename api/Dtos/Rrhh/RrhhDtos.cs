namespace api.Dtos.Rrhh;

public class CargoDto
{
    public int IdCargo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}

public class CargoUpsertDto
{
    public int IdCargo { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; } = true;
}

public class EmpleadoCargoDto
{
    public int IdEmpleadoCargo { get; set; }
    public int IdEmpleado { get; set; }
    public string Empleado { get; set; } = string.Empty;
    public int IdCargo { get; set; }
    public string Cargo { get; set; } = string.Empty;
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public bool Activo { get; set; }
}

public class EmpleadoCargoUpsertDto
{
    public int IdEmpleadoCargo { get; set; }
    public int IdEmpleado { get; set; }
    public int IdCargo { get; set; }
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public bool Activo { get; set; } = true;
}

public class ConceptoSalarioDto
{
    public int IdConceptoSalario { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public bool DeducibleIps { get; set; }
    public bool EsSalarioBase { get; set; }
    public bool EsIps { get; set; }
    public bool EsBonificacionFamiliar { get; set; }
    public bool Activo { get; set; }
}

public class ConceptoSalarioUpsertDto
{
    public int IdConceptoSalario { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Tipo { get; set; } = "Ingreso";
    public bool DeducibleIps { get; set; }
    public bool EsSalarioBase { get; set; }
    public bool EsIps { get; set; }
    public bool EsBonificacionFamiliar { get; set; }
    public bool Activo { get; set; } = true;
}

public class EmpleadoConceptoMensualDto
{
    public int IdEmpleadoConceptoMensual { get; set; }
    public int IdEmpleado { get; set; }
    public string Empleado { get; set; } = string.Empty;
    public int IdConceptoSalario { get; set; }
    public string ConceptoSalario { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public bool Activo { get; set; }
}

public class EmpleadoConceptoMensualUpsertDto
{
    public int IdEmpleadoConceptoMensual { get; set; }
    public int IdEmpleado { get; set; }
    public int IdConceptoSalario { get; set; }
    public decimal Monto { get; set; }
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public bool Activo { get; set; } = true;
}

public class ParametroSalarioDto
{
    public int IdParametroSalario { get; set; }
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public decimal SalarioMinimo { get; set; }
    public decimal PorcentajeIpsEmpleado { get; set; }
    public decimal PorcentajeBonificacionFamiliar { get; set; }
    public bool Activo { get; set; }
}

public class ParametroSalarioUpsertDto
{
    public int IdParametroSalario { get; set; }
    public DateOnly FechaDesde { get; set; }
    public DateOnly? FechaHasta { get; set; }
    public decimal SalarioMinimo { get; set; }
    public decimal PorcentajeIpsEmpleado { get; set; } = 9m;
    public decimal PorcentajeBonificacionFamiliar { get; set; } = 5m;
    public bool Activo { get; set; } = true;
}

public class ProcesoPagoSalarioDto
{
    public int IdProcesoPagoSalario { get; set; }
    public int PeriodoAnho { get; set; }
    public int PeriodoMes { get; set; }
    public DateOnly FechaPago { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? IdAsiento { get; set; }
    public decimal TotalIngresos { get; set; }
    public decimal TotalEgresos { get; set; }
    public decimal TotalNeto { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CerradoAt { get; set; }
}

public class ProcesoPagoSalarioUpsertDto
{
    public int PeriodoAnho { get; set; }
    public int PeriodoMes { get; set; }
    public DateOnly FechaPago { get; set; }
}

public class PagoSalarioDetalleDto
{
    public int IdPagoSalarioDetalle { get; set; }
    public int IdProcesoPagoSalario { get; set; }
    public int IdEmpleado { get; set; }
    public string Empleado { get; set; } = string.Empty;
    public int IdConceptoSalario { get; set; }
    public string ConceptoSalario { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public bool DeducibleIps { get; set; }
    public bool EsAutomatico { get; set; }
    public string? Observacion { get; set; }
}

public class PagoSalarioDetalleUpsertDto
{
    public int IdEmpleado { get; set; }
    public int IdConceptoSalario { get; set; }
    public decimal Monto { get; set; }
    public string? Observacion { get; set; }
}

public class CerrarProcesoPagoSalarioDto
{
    public int IdModulo { get; set; }
    public int IdCuentaGastoSalarios { get; set; }
    public int IdCuentaPago { get; set; }
    public int? IdCuentaIpsPagar { get; set; }
    public int? IdCuentaOtrosEgresosPagar { get; set; }
    public string? DescripcionAsiento { get; set; }
}

public class ReciboPagoSalarioDto
{
    public string Copia { get; set; } = string.Empty;
    public int IdProcesoPagoSalario { get; set; }
    public int IdEmpleado { get; set; }
    public string Empleado { get; set; } = string.Empty;
    public string Ci { get; set; } = string.Empty;
    public string Ruc { get; set; } = string.Empty;
    public int PeriodoAnho { get; set; }
    public int PeriodoMes { get; set; }
    public DateOnly FechaPago { get; set; }
    public List<PagoSalarioDetalleDto> Ingresos { get; set; } = new();
    public List<PagoSalarioDetalleDto> Egresos { get; set; } = new();
    public decimal TotalIngresos { get; set; }
    public decimal TotalEgresos { get; set; }
    public decimal NetoPagar { get; set; }
}
