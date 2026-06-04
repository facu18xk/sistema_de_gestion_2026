using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi.Models;

namespace api.Settings;

public static class SwaggerModules
{
    public const string AllDocumentName = "v1";

    public static readonly IReadOnlyDictionary<string, OpenApiInfo> Documents =
        new Dictionary<string, OpenApiInfo>
        {
            [AllDocumentName] = new() { Title = "api", Version = "v1" },
            ["auth"] = new() { Title = "api - Auth", Version = "v1" },
            ["catalogos"] = new() { Title = "api - Catalogos", Version = "v1" },
            ["compras"] = new() { Title = "api - Compras", Version = "v1" },
            ["ventas"] = new() { Title = "api - Ventas", Version = "v1" },
            ["contabilidad"] = new() { Title = "api - Contabilidad", Version = "v1" },
            ["tesoreria"] = new() { Title = "api - Tesoreria", Version = "v1" }
        };

    private static readonly IReadOnlyDictionary<string, string> ControllerModules =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Auth"] = "auth",

            ["Categorias"] = "catalogos",
            ["CategoriasProveedores"] = "catalogos",
            ["Ciudades"] = "catalogos",
            ["Depositos"] = "catalogos",
            ["Direcciones"] = "catalogos",
            ["Estados"] = "catalogos",
            ["Marcas"] = "catalogos",
            ["Modulos"] = "catalogos",
            ["Paises"] = "catalogos",
            ["Productos"] = "catalogos",
            ["ProductosProveedores"] = "catalogos",
            ["Proveedores"] = "catalogos",
            ["StocksDepositos"] = "catalogos",

            ["CotizacionesCompras"] = "compras",
            ["CotizacionesComprasDetalles"] = "compras",
            ["FacturasCompras"] = "compras",
            ["MediosPagosCompras"] = "compras",
            ["OrdenesCompras"] = "compras",
            ["OrdenesComprasDetalles"] = "compras",
            ["OrdenesMediosPagosCompras"] = "compras",
            ["OrdenesPagosCompras"] = "compras",
            ["OrdenesPagosComprasDetalles"] = "compras",
            ["PedidosCompras"] = "compras",
            ["PedidosComprasDetalles"] = "compras",
            ["PedidosCotizaciones"] = "compras",
            ["PedidosCotizacionesDetalles"] = "compras",

            ["FacturasVentas"] = "ventas",
            ["FacturasVentasDetalles"] = "ventas",
            ["NotasCreditosVentas"] = "ventas",
            ["NotasCreditosVentasDetalles"] = "ventas",
            ["NotasDevolucionesVentas"] = "ventas",
            ["NotasDevolucionesVentasDetalles"] = "ventas",
            ["OrdenesVentas"] = "ventas",
            ["OrdenesVentasDetalles"] = "ventas",
            ["PreciosVentas"] = "ventas",
            ["Presupuestos"] = "ventas",
            ["PresupuestosDetalles"] = "ventas",
            ["Timbrados"] = "ventas",

            ["Asientos"] = "contabilidad",
            ["AsientosDetalles"] = "contabilidad",
            ["Balances"] = "contabilidad",
            ["BalancesDetalles"] = "contabilidad",
            ["ContabilidadReportes"] = "contabilidad",
            ["CuentasContables"] = "contabilidad",
            ["ModelosAsientos"] = "contabilidad",
            ["ModelosAsientosDetalles"] = "contabilidad",
            ["PeriodosContables"] = "contabilidad",
            ["ProcesosContables"] = "contabilidad"
            ,
            ["Bancos"] = "tesoreria",
            ["CuentasBancarias"] = "tesoreria",
            ["TiposCuentasBancarias"] = "tesoreria",
            ["MovimientosBancarios"] = "tesoreria",
            ["TiposMovimientosBancarios"] = "tesoreria",
            ["ChequesEmitidos"] = "tesoreria",
            ["DepositosBancarios"] = "tesoreria",
            ["TiposDepositosBancarios"] = "tesoreria",
            ["DetallesDepositosBancarios"] = "tesoreria",
            ["ChequesMismoBanco"] = "tesoreria",
            ["ChequesTerceros"] = "tesoreria"
        };

    public static bool IncludesApi(string documentName, ApiDescription apiDescription)
    {
        if (documentName == AllDocumentName)
        {
            return true;
        }

        var controllerName = GetControllerName(apiDescription);
        return controllerName is not null &&
               ControllerModules.TryGetValue(controllerName, out var moduleName) &&
               moduleName == documentName;
    }

    public static IList<string> GetTags(ApiDescription apiDescription)
    {
        var controllerName = GetControllerName(apiDescription);
        if (controllerName is null)
        {
            return new[] { "otros" };
        }

        return new[] { controllerName };
    }

    private static string? GetControllerName(ApiDescription apiDescription)
    {
        return apiDescription.ActionDescriptor.RouteValues.TryGetValue("controller", out var controllerName)
            ? controllerName
            : null;
    }
}
