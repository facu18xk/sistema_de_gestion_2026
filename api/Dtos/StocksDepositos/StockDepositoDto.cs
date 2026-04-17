namespace api.Dtos.StocksDepositos;

public class StockDepositoDto
{
    public int IdDeposito { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public string Deposito { get; set; } = string.Empty;

    public string Producto { get; set; } = string.Empty;
}
