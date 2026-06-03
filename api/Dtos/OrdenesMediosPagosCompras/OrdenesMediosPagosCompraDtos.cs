namespace api.Dtos.OrdenesMediosPagosCompras;

public class OrdenesMediosPagosCompraDto
{
    public int IdOrdenMedioPagoCompra { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdMedioPagoCompra { get; set; }
    
    public decimal Monto { get; set; }

    public MedioPagoResumenDto? MedioPago { get; set; }
<<<<<<< HEAD

    public int? IdCuentaBancaria { get; set; }

    public int? IdMovimientoBancario { get; set; }

    public int? IdChequeEmitido { get; set; }
=======
>>>>>>> front
}

public class MedioPagoResumenDto
{
    public int IdMedioPagoCompra { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class OrdenesMediosPagosCompraUpsertDto
{
    public int IdOrdenMedioPagoCompra { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdMedioPagoCompra { get; set; }
    
    public decimal Monto { get; set; }
<<<<<<< HEAD

    public int? IdCuentaBancaria { get; set; }

    public string? NumeroCheque { get; set; }

    public string? Beneficiario { get; set; }

    public string? ReferenciaBancaria { get; set; }
}
=======
}
>>>>>>> front
