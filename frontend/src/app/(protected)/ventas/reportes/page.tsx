"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, FileBarChart2, Download, RefreshCw, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { DataTable } from "@/components/shared/data-table"
import { facturasAPI } from "@/services/facturasAPI"
import { FacturaVentaCompleto, ReporteProducto, ReporteCliente } from "@/types/types"
import { formatGuaranies } from "@/utils/money-format"
import { notify } from "@/lib/notifications"
import { formatearNumeroProducto } from "@/utils/producto-format"

export default function ReportesVentasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [facturas, setFacturas] = useState<FacturaVentaCompleto[]>([])
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>("")

  // 1. CARGA DE TODAS LAS FACTURAS EMITIDAS (Excluyendo las Anuladas)
  const cargarDatos = async () => {
    setIsLoading(true)
    try {
      const response = await facturasAPI.getAllCompleto(1, 500)
      const facturasValidas = response.items.filter(f => f.estado === "Emitido")
      setFacturas(facturasValidas)
    } catch (error) {
      console.error("Error al cargar datos para reportes:", error)
      notify.error("Error", "No se pudieron obtener los datos de ventas.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { cargarDatos() }, [])

  // 2. PROCESAMIENTO DE REPORTES (Agrupación de datos usando useMemo)
  
  // Reporte A: Productos por cantidad vendida
  const reporteProductos = useMemo(() => {
    const mapaProductos: Record<number, ReporteProducto> = {}

    facturas.forEach(factura => {
      factura.items.forEach(item => {
        if (!mapaProductos[item.idProducto]) {
          mapaProductos[item.idProducto] = {
            idProducto: item.idProducto,
            descripcion: item.producto || `Producto #${item.idProducto}`,
            cantidadVendida: 0
          }
        }
        mapaProductos[item.idProducto].cantidadVendida += item.cantidad
      })
    })
    return Object.values(mapaProductos).sort((a, b) => b.cantidadVendida - a.cantidadVendida)
  }, [facturas])

  // Reportes B y C: Clientes (Agrupa tanto cantidad de facturas como montos totales)
  const reporteClientes = useMemo(() => {
    const mapaClientes: Record<number, ReporteCliente> = {}

    facturas.forEach(factura => {
      if (!mapaClientes[factura.idCliente]) {
        mapaClientes[factura.idCliente] = {
          idCliente: factura.idCliente,
          nombreCliente: factura.cliente,
          cantidadFacturas: 0,
          montoTotal: 0,
        }
      }
      mapaClientes[factura.idCliente].cantidadFacturas += 1
      const totalFactura = factura.items.reduce((sum, item) => sum + item.totalNeto, 0)
      mapaClientes[factura.idCliente].montoTotal += totalFactura
    })

    const lista = Object.values(mapaClientes)

    if (reporteSeleccionado === "clientes_monto") {
      return lista.sort((a, b) => b.montoTotal - a.montoTotal) // Mayor monto primero
    }
    return lista.sort((a, b) => b.cantidadFacturas - a.cantidadFacturas) // Mayor cantidad de compras primero
  }, [facturas, reporteSeleccionado])

  // 3. RENDERIZADO DINÁMICO DE CABECERAS DE TABLA
  const renderHeader = () => {
    if (reporteSeleccionado === "productos_cantidad") {
      return (
        <TableRow>
          <TableHead className="w-[100px]">Producto</TableHead>
          <TableHead>Descripción del Producto</TableHead>
          <TableHead className="w-[180px] text-right">Cantidad Total Vendida</TableHead>
        </TableRow>
      )
    }
    
    // Si es reporte de clientes (sea por monto o por cantidad) las columnas base coinciden
    return (
      <TableRow>
        <TableHead className="w-[100px]">ID Cliente</TableHead>
        <TableHead>Nombre / Razón Social</TableHead>
        <TableHead className="w-[180px] text-center">Cant. Facturas Emitidas</TableHead>
        <TableHead className="w-[200px] text-right">Monto Total Comprado</TableHead>
      </TableRow>
    )
  }

  const imprimirReporte = () => {
    // 1. Creamos el iframe oculto
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // 2. Definimos títulos según el reporte activo
    let tituloReporte = "";
    let tablaHeadersHtml = "";
    let tablaFilasHtml = "";

    if (reporteSeleccionado === "productos_cantidad") {
      tituloReporte = "Reporte de Productos por Cantidad Vendida";
      tablaHeadersHtml = `
        <tr>
          <th style="text-align: left; width: 80px;">Código</th>
          <th style="text-align: left;">Descripción del Producto</th>
          <th style="text-align: right; width: 150px;">Total Vendido</th>
        </tr>`;
      
      tablaFilasHtml = reporteProductos.map((prod, index) => `
        <tr>
          <td style="color: #666; font-family: monospace;">${formatearNumeroProducto(prod.idProducto)}</td>
          <td><strong>${index + 1}.</strong> ${prod.descripcion}</td>
          <td style="text-align: right; font-weight: bold;">${prod.cantidadVendida} uds.</td>
        </tr>`).join("");

    } else {
      const porMonto = reporteSeleccionado === "clientes_monto";
      tituloReporte = porMonto 
        ? "Reporte de Clientes por Monto de Ventas" 
        : "Reporte de Clientes por Cantidad de Ventas (Facturas)";
      
      tablaHeadersHtml = `
        <tr>
          <th style="text-align: left; width: 80px;">ID</th>
          <th style="text-align: left;">Nombre / Razón Social</th>
          <th style="text-align: center; width: 120px;">Cant. Facturas</th>
          <th style="text-align: right; width: 150px;">Monto Total</th>
        </tr>`;

      tablaFilasHtml = reporteClientes.map((cli, index) => `
        <tr>
          <td style="color: #666; font-family: monospace;">#${cli.idCliente}</td>
          <td><strong>${index + 1}.</strong> ${cli.nombreCliente}</td>
          <td style="text-align: center;">${cli.cantidadFacturas} fct.</td>
          <td style="text-align: right; font-weight: bold; ${porMonto ? 'color: #10b981;' : ''}">
            ${formatGuaranies(cli.montoTotal)}
          </td>
        </tr>`).join("");
    }

    // 3. Estructura HTML y estilos CSS para la impresión
    const htmlContenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Reporte</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 20px; font-size: 13px; }
          .header { margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 20px; color: #111; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f8fafc; color: #475569; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding: 10px; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px; border-bottom: 1px solid #edf2f7; }
          tr:nth-child(even) { background-color: #fdfdfd; }
          .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${tituloReporte}</h1>
          <p>Fecha de Impresión: ${new Date().toLocaleString('es-PY')} | McQueen Tires | Departamento de Ventas</p>
        </div>
        <table>
          <thead>${tablaHeadersHtml}</thead>
          <tbody>${tablaFilasHtml}</tbody>
        </table>
        <div class="footer">
          Documento generado automáticamente para auditoría interna.
        </div>
      </body>
      </html>
    `;

    // 4. Escribir y mandar a imprimir
    doc.open();
    doc.write(htmlContenido);
    doc.close();

    iframe.contentWindow?.focus();
    // Añadimos un brevísimo delay para asegurar que el HTML terminó de renderizarse en el DOM del iframe
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Removemos el iframe después de cerrar el cuadro de diálogo de impresión
      document.body.removeChild(iframe);
    }, 250);
  };

  return (
    <>
      {/* BREADCRUMB */}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Reportes De Ventas" }]} />

      {/* CABECERA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 my-3">
            <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <FileBarChart2 className="h-5 w-5 text-primary" /> Reportes de Ventas
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                Análisis de rendimiento basado en facturas vigentes emitidas.
                </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={cargarDatos} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Recargar
                </Button>
                
                {/* NUEVO BOTÓN DE IMPRIMIR */}
                <Button 
                variant="default" 
                size="sm" 
                onClick={imprimirReporte} 
                disabled={isLoading || facturas.length === 0 || !reporteSeleccionado}
                className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                <Printer className="h-4 w-4 mr-2" /> Imprimir Reporte
                </Button>
            </div>
        </div>

      {/* SELECTOR DE REPORTES */}
      <div className="p-4 border rounded-lg bg-slate-50/50 shadow-sm my-4 max-w-xl">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
          Seleccione el tipo de reporte
        </label>
        <Select value={reporteSeleccionado} onValueChange={(val) => setReporteSeleccionado(val)}>
          <SelectTrigger className="w-full bg-white h-9 shadow-sm text-sm">
            <SelectValue placeholder="Seleccione un reporte..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productos_cantidad" className="text-sm">
              Lista de productos por cantidad vendida
            </SelectItem>
            <SelectItem value="clientes_cantidad" className="text-sm">
              Lista de clientes por cantidad de ventas (Facturas)
            </SelectItem>
            <SelectItem value="clientes_monto" className="text-sm">
              Lista de clientes por monto de ventas (Total Gs.)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* TABLA DE RESULTADOS REPORTE */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : reporteSeleccionado === "" ? (
        // Mensaje cuando entran por primera vez
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-lg bg-white shadow-sm text-center">
          <FileBarChart2 className="h-10 w-10 text-muted-foreground/60 mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-semibold text-slate-800">No hay ningún reporte seleccionado</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Por favor, elige una de las opciones del menú desplegable superior para procesar y ver las estadísticas de ventas.
          </p>
        </div>
      ) : (
        <DataTable
          caption="Resultados del reporte estadístico."
          headerRow={renderHeader()}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}} // Desactivamos paginación compleja para reportes agregados planos
        >
          {/* RENDERIZADO REPORTE PRODUCTOS */}
          {reporteSeleccionado === "productos_cantidad" && 
            reporteProductos.map((prod, index) => (
              <TableRow key={prod.idProducto} className="hover:bg-slate-50/40">
                <TableCell className="font-mono text-xs text-muted-foreground">{formatearNumeroProducto(prod.idProducto)}</TableCell>
                <TableCell className="font-medium">
                  <span className="mr-2 text-slate-400 font-bold text-xs">{index + 1}.</span>
                  {prod.descripcion}
                </TableCell>
                <TableCell className="text-right font-bold text-slate-900 pr-6">
                  {prod.cantidadVendida} uds.
                </TableCell>
              </TableRow>
            ))
          }
          {/* RENDERIZADO REPORTE CLIENTES (CANTIDAD O MONTO) */}
          {(reporteSeleccionado === "clientes_cantidad" || reporteSeleccionado === "clientes_monto") &&
            reporteClientes.map((cli, index) => (
              <TableRow key={cli.idCliente} className="hover:bg-slate-50/40">
                <TableCell className="font-mono text-xs text-muted-foreground">#{cli.idCliente}</TableCell>
                <TableCell className="font-medium">
                  <span className="mr-2 text-slate-400 font-bold text-xs">{index + 1}.</span>
                  {cli.nombreCliente}
                </TableCell>
                <TableCell className={`text-center ${reporteSeleccionado === 'clientes_cantidad' ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {cli.cantidadFacturas} fct.
                </TableCell>
                <TableCell className={`text-right pr-4 font-bold ${reporteSeleccionado === 'clientes_monto' ? 'text-emerald-600 text-sm' : 'text-slate-800'}`}>
                  {formatGuaranies(cli.montoTotal)}
                </TableCell>
              </TableRow>
            ))
          }
          {/* MENSAJE DE TABLA VACÍA */}
          {facturas.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
                No hay datos de facturación disponibles en este periodo para procesar.
              </TableCell>
            </TableRow>
          )}
        </DataTable>
      )}
    </>
  )
}