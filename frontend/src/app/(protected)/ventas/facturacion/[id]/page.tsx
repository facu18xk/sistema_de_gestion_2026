"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, ReceiptText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format";
import { facturasAPI } from "@/services/facturasAPI";
import { timbradosAPI } from "@/services/timbradosAPI";
import { estadosAPI } from "@/services/estadosAPI";
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI";
import { formatearFecha } from "@/utils/date-utils";
import { Cliente, FacturaVentaCompleto, Timbrado, FacturaVentaCabeceraSave, Estado } from "@/types/types";
import { esVigenteParaNotaCredito } from "@/utils/date-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { clientesAPI } from "@/services/clientesAPI";
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { formatPhone } from "@/utils/phone-format";

/*const res = {
    "idFacturaVenta": 1,
    "idPresupuesto": 1,
    "presupuestoDescripcion": "Factura de Venta 1",
    "idCliente": 1,
    "cliente": "Cliente 1",
    "nroComprobante": "-- Sin especificar --",
    "idTimbrado": 1,
    "timbrado": "",
    "timbradoRuc": "",
    "fecha": "2026-05-22",
    "descripcion": "Descripcion 1",
    "idMedioPagoCompra": 1,
    "medioPagoCompra": "Efectivo",
    "fechaPago": "2026-05-22",
    "items": [{
        "idProducto": 1,
        "producto": "Producto Prueba",
        "cantidad": 5,
        "precioUnitario": 1000,
        "totalBruto": 5000,
        "totalIva": 500,
        "totalNeto": 5500
    },]
};*/

export default function DetalleFacturaPage() {
  const router = useRouter();
  const params = useParams();
  const idFactura = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState<FacturaVentaCompleto | null>(null);
  const [timbrado, setTimbrado] = useState<Timbrado | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [isExpiradoAlertOpen, setIsExpiradoAlertOpen] = useState(false);
  const [idEstadoOriginal, setIdEstadoOriginal] = useState<number>(7);
  const [idEstadoNuevo, setIdEstadoNuevo] = useState<number>(7);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnulado, setIsAnulado] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tieneNotasAsociadas, setTieneNotasAsociadas] = useState(false);

  const columnWidths = {
    producto: "w-[40%]",
    cantidad: "w-[100px]",
    precio: "w-[140px]",
    iva: "w-[120px]",
    subtotal: "w-[140px]",
  };

  useEffect(() => {
    const obtenerFactura = async () => {
      try {
        setLoading(true);
        // Llama a tu endpoint: /api/FacturasVentas/{id}/completo
        // Si no lo tienes mapeado en facturasAPI, puedes usar un fetch directamente.
        const resFacturas = await facturasAPI.getById(idFactura);

        if (!resFacturas) {
          notify.error("Error", "La factura solicitada no existe.");
          router.push("/ventas/facturacion");
          return;
        }
        setFactura(resFacturas);
        setIdEstadoOriginal(resFacturas.idEstado);
        const anulado = resFacturas.idEstado === 8 ? true : false;
        setIsAnulado(anulado);
        const resNotasCredito = await notasCreditosVentasAPI.getAll(1, 100);
        const tieneNotas = resNotasCredito.items.filter((n) => n.idFacturaVenta === idFactura).length !== 0 ? true : false;
        setTieneNotasAsociadas(tieneNotas);
        const resTimbrado = await timbradosAPI.getById(1);
        setTimbrado(resTimbrado);
        const resCliente = await clientesAPI.getById(resFacturas.idCliente);
        setCliente(resCliente);
        const resEstados = await estadosAPI.getAll();
        const estadosFiltrados = resEstados.items.filter((e) => e.idEstado === 7 || e.idEstado === 8);
        estadosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        //console.log(estadosFiltrados)
        setEstados(estadosFiltrados);
      } catch (error) {
        console.error("Error al obtener la factura:", error);
        notify.error("Error de conexión", "No se pudieron cargar los datos de la factura.");
      } finally {
        setLoading(false);
      }
    };

    if (idFactura) obtenerFactura();
  }, [idFactura, router]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos de la factura...</div>;
  if (!factura) return <div className="p-8 text-center text-muted-foreground">No se encontró la factura.</div>;

  // Calculamos el total general sumando el totalNeto (o totalBruto + IVA según maneje tu backend) de cada ítem
  const totalGeneral = factura.items.reduce((acc, item) => acc + item.totalNeto, 0);

  const handleCrearNotaCredito = () => {
    const esVigente = esVigenteParaNotaCredito(factura.fechaPago);
    console.log(`Vigencia: ${esVigente}`)
    if (esVigente) {
      router.push(`/ventas/devoluciones/nuevo?facturaId=${idFactura}`);
      notify.success("Procesando", "Iniciando la generación de la Nota de Crédito...");
    } else {
      setIsExpiradoAlertOpen(true);
    }
  };

  const handleEditarFactura = async () => {
    if (tieneNotasAsociadas) {
      notify.error("Acción inválida", "La factura tiene notas de crédito asociadas.");
      return;
    }
    if (!factura) return;
    setIsUpdating(true);
    const payload: FacturaVentaCabeceraSave = {...factura, idEstado: idEstadoNuevo};
    //console.log(payload)
    try {
          await facturasAPI.update(idFactura, payload);
          notify.success("¡Factura Actualizada!", "Todos los cambios se guardaron con éxito.");
          router.push("/ventas/facturacion");
          router.refresh();
        } catch (error) {
          console.error("Error al actualizar la factura:", error);
          notify.error("Error", "No se pudieron registrar las modificaciones en el servidor.");
        } finally {
          setIsUpdating(false);
        }
  }

  const imprimirFactura = () => {
    if (!factura) return;
  
    // 1. Calculamos los totales necesarios para el pie de página
    const totalIvaAcumulado = factura.items.reduce((acc, item) => acc + item.totalIva, 0);
    const fechaStart = String(timbrado?.fechaInicio);
    const fechaEnd = String(timbrado?.fechaFinal);
  
    // 2. Creamos un iframe oculto en el documento
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
  
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
  
    // 3. Escribimos el HTML y los estilos estrictos A4 dentro del iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${factura.nroComprobante}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            color: #000000;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
          }
          /* Estructura Maestra en 4 Filas */
          .factura-contenedor {
            display: grid;
            grid-template-rows: auto auto 1fr auto;
            gap: 20px;
            height: 260mm; /* Ajuste para que entre perfecto en el alto de la página */
            padding: 10px;
          }
          
          /* Fila 1 */
          .fila-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #000000;
            padding-bottom: 15px;
          }
          .header-empresa h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: 900; text-transform: uppercase; }
          .header-empresa p { margin: 2px 0; color: #334155; }
          .header-timbrado {
            border: 1px solid #000000;
            padding: 10px;
            border-radius: 6px;
            min-width: 220px;
          }
          .header-timbrado p { margin: 2px 0; }
          .comprobante-titulo { font-size: 10px; text-transform: uppercase; color: #64748b; margin-top: 8px; }
          .comprobante-numero { font-family: monospace; font-size: 15px; font-weight: bold; color: #047857; margin: 2px 0; }
  
          /* Fila 2 */
          .fila-cliente {
            border: 1px solid #000000;
            border-radius: 6px;
            padding: 12px;
          }
          .cliente-titulo { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; margin: 0 0 8px 0; }
          .cliente-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
          .data-block p { margin: 2px 0; }
          .data-label { color: #64748b; font-size: 10px; }
          .data-value { font-weight: 600; }
  
          /* Fila 3 */
          .fila-detalles {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
          }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f1f5f9; color: #000000; border: 1px solid #000000; font-weight: bold; padding: 8px; text-align: left; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
          tr { page-break-inside: avoid; }
          .text-right { text-align: right; }
  
          /* Fila 4 */
          .fila-totales {
            border-top: 2px solid #000000;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .iva-liquidacion { color: #64748b; }
          .iva-liquidacion span { margin-right: 15px; }
          .total-monto { text-align: right; }
          .total-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
          .total-valor { font-size: 20px; font-weight: 900; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="factura-contenedor">
          
          <div class="fila-header">
            <div class="header-empresa">
              <h2>McQueen Tires</h2>
              <p>Representante oficial del Rayo McQueen</p>
              <p>Casa Central: Av. Bernardino Caballero & Av. Irrazábal</p>
              <p>Encarnación, Itapúa, Paraguay</p>
              <p>Teléfono: +595 71 200000</p>
              <p>Email: mcqueentires@gmail.com</p>
              <p style="font-weight: bold; margin-top: 5px;">RUC: 80012345-6</p>
            </div>
            <div class="header-timbrado">
              <p><strong>TIMBRADO N°:</strong> ${factura.timbrado || "1654321"}</p>
              <p><span class="data-label">Fecha Inicio:</span> ${formatearFecha(fechaStart) || "80012345-6"}</p>
              <p><span class="data-label">Fecha Fin:</span> ${formatearFecha(fechaEnd)}</p>
              <div class="comprobante-titulo">Factura de Venta</div>
              <div class="comprobante-numero">${factura.nroComprobante}</div>
              <div class="comprobante-titulo">Presupuesto Asociado</div>
              <div class="comprobante-numero">${formatearNumeroPresupuesto(factura.idPresupuesto)}</div>
            </div>
          </div>
  
          <div class="fila-cliente">
            <div class="cliente-titulo">Información del Cliente</div>
            <div class="cliente-grid">
              <div class="data-block">
                <div class="data-label">Razón Social o Nombre</div>
                <div class="data-value">${factura.cliente || "Sin especificar"}</div>
              </div>
              <div class="data-block">
                <div class="data-label">CI/RUC</div>
                <div class="data-value">${cliente?.ruc ? formatRUC(cliente?.ruc) : formatCI(cliente?.ci)}</div>
              </div>
              <div class="data-block">
                <div class="data-label">Correo</div>
                <div class="data-value">${cliente?.correo || "Sin especificar"}</div>
              </div>
              <div class="data-block">
                <div class="data-label">Telefono</div>
                <div class="data-value">${formatPhone(cliente?.telefono) || "Sin especificar"}</div>
              </div>
              <div class="data-block">
                <div class="data-label">Fecha de Emisión</div>
                <div class="data-value">${formatearFecha(factura.fecha)}</div>
              </div>
              <div class="data-block">
                <div class="data-label">Condición de Pago</div>
                <div class="data-value">${"Contado"}</div>
              </div>
            </div>
          </div>
  
          <div class="fila-detalles">
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Descripción del Producto</th>
                  <th style="width: 10%;">Cantidad</th>
                  <th style="width: 15%;">Precio Unitario</th>
                  <th style="width: 15%;">Liquidación IVA</th>
                  <th style="width: 15%; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${factura.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.producto}</strong><br/>
                      <span style="font-size: 9px; color: #64748b; font-family: monospace;">${formatearNumeroProducto(item.idProducto)}</span>
                    </td>
                    <td>${item.cantidad}</td>
                    <td>${formatGuaranies(item.precioUnitario)}</td>
                    <td>${formatGuaranies(item.totalIva)}</td>
                    <td class="text-right" style="font-weight: bold;">${formatGuaranies(item.totalNeto)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
  
          <div class="fila-totales">
            <div class="iva-liquidacion">
              <strong>Liquidación del Impuesto:</strong>
              <span>(5%): ₲ 0</span>
              <span>(10%): ${formatGuaranies(totalIvaAcumulado)}</span>
              <span><strong>Total IVA:</strong> ${formatGuaranies(totalIvaAcumulado)}</span>
            </div>
            <div class="total-monto">
              <div class="total-label">Total General a Pagar</div>
              <div class="total-valor">${formatGuaranies(totalGeneral)}</div>
            </div>
          </div>
  
        </div>
      </body>
      </html>
    `);
    doc.close();
  
    // 4. Esperamos a que el contenido cargue en el iframe y disparamos la impresión
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      // 5. Eliminamos el iframe del DOM para no saturar la memoria
      document.body.removeChild(iframe);
    }, 500);
  };

  return (
    <>
      {/* BREADCRUMB */}
      <PageBreadcrumb steps={[
        { label: "Ventas", href: "#" }, 
        { label: "Facturación", href: "/ventas/facturacion" }, 
        { label: `Factura N° ${factura.nroComprobante}` }
      ]} />
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Factura de Venta</h1>
      </div>
      {/* ALERT DIALOG PARA MENSAJE */}
      <AlertDialog open={isExpiradoAlertOpen} onOpenChange={setIsExpiradoAlertOpen}>
        <AlertDialogContent className="max-w-[450px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              Plazo de Emisión Vencido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 pt-2 text-sm leading-relaxed">
              No es posible generar una Nota de Crédito para esta factura. Según las reglas de negocio, 
              estos comprobantes solo pueden ser emitidos dentro de las <strong>48 horas</strong> posteriores 
              a la emisión de la factura.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setIsExpiradoAlertOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* MODAL DIALOG CONFIRMACIÓN ANULACIÓN */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estas a punto de anular la factura <span className="font-bold text-foreground">{factura.nroComprobante}</span>. Esta acción no se puede deshacer. ¿Estás completamente seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditarFactura} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* CABECERA DE ACCIONES */}
      <div className="flex justify-between items-center my-2">
        <div>
          {factura.idPresupuesto > 0 && (
            <p className="text-xs text-muted-foreground font-medium">
              Viculada al Presupuesto: <span className="text-slate-800 font-semibold">{formatearNumeroPresupuesto(factura.idPresupuesto)}</span> ({factura.presupuestoDescripcion})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/ventas/facturacion")}>
            <ArrowLeft className="h-4 w-4 mr-2"/> Volver al listado
          </Button>
          {!isAnulado && (<Button size="sm" variant="secondary" onClick={() => imprimirFactura()} className="gap-2">
            <Printer className="h-4 w-4"/> Imprimir
          </Button>)}
          {!isAnulado && (<Button
            size="sm"
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCrearNotaCredito}
          >
              <ReceiptText className="h-4 w-4"/> {"Generar Nota de Crédito"}
          </Button>)}
          {!isAnulado && (<Button size="sm" variant="default" className="gap-2" onClick={() => setIsAlertOpen(true)} disabled={isUpdating || (idEstadoOriginal === idEstadoNuevo)}>
              <Save className="h-4 w-4"/> {isUpdating ? "Actualizando..." : "Actualizar"}
          </Button>)}
        </div>
      </div>
      {/* CABECERA DE DATOS */}
      <div className="p-4 border rounded-lg bg-slate-50/60 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">  
          {/* DATOS CLIENTE */}
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Datos del Cliente
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <p className="text-muted-foreground text-[13px]">Razón Social / Cliente</p>
                <p className="font-semibold text-slate-900 text-[13px]">{factura.cliente || "Sin especificar"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[13px]">N° Comprobante</p>
                <p className="font-semibold text-emerald-700 text-[13px]">{factura.nroComprobante}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[13px]">Timbrado N°</p>
                <p className="font-semibold text-slate-800 text-[13px]">{factura.timbrado} <span className="text-xs text-muted-foreground">({factura.timbradoRuc})</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[13px]">Fecha de Emisión</p>
                <p className="font-semibold text-slate-700 text-[13px]">{formatearFecha(factura.fecha)}</p>
              </div>
            </div>
          </div>
          {/* MEDIO PAGO Y DESCRIPCIÓN*/}
          <div className="grid grid-cols-1 gap-x-3 gap-y-2">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Medio de Pago</p>
              <p className="font-semibold text-slate-800 bg-white border rounded px-2.5 py-1 text-[13px] shadow-sm inline-block w-full">
                {factura.medioPagoCompra || "Efectivo"}
              </p>
            </div>
          <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Descripción Interna</p>
              <p className="text-slate-700 bg-white border rounded px-2.5 py-1 text-[12px] shadow-sm italic min-h-[30px] flex items-center">
                {factura.descripcion || "Sin observaciones."}
              </p>
          </div>
          </div>
          {/* ESTADO DE LA FACTURA */}
          <div className="grid grid-col-1">
          <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estado de la Factura
          </label>
          {factura.idEstado === 8 ? (
              <span className="inline-flex items-center justify-start rounded-full bg-white px-3 py-1.5 text-sm font-bold text-red-500 border shadow-sm w-full md:w-auto">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                  Anulado
              </span>
              ) : (
              <Select
              value={String(idEstadoNuevo)}
              onValueChange={(val) => setIdEstadoNuevo(Number(val))}
              disabled={isUpdating}
              >
                <SelectTrigger className="w-full h-8 bg-white shadow-sm text-sm mt-0.5">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((est) => (
                    <SelectItem key={est.idEstado} value={String(est.idEstado)} className="text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        est.idEstado === 7 ? "bg-green-500" : 
                        est.idEstado === 8 ? "bg-red-500" : "bg-red-400"
                      }`} />
                      {est.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>)} 
          </div>
          {/*<div className="flex flex-col justify-start h-full md:items-end md:pl-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Estado de Factura</span>
            <div className="w-full md:w-auto">
              <span className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 border border-green-200 shadow-sm w-full md:w-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                  Emitida
              </span>
            </div>
          </div>*/}
        </div>
      </div>
      {/* TABLA DE ITEMS MODO LECTURA */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex flex-col mt-4">
        {/* CABECERA TABLA */}
        <div className="bg-slate-100 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className={columnWidths.producto}>Producto</TableHead>
                <TableHead className={columnWidths.cantidad}>Cantidad</TableHead>
                <TableHead className={columnWidths.precio}>Precio Unitario</TableHead>
                <TableHead className={columnWidths.iva}>IVA</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal Neto</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* CUERPO TABLA */}
        <div className="max-h-[350px] overflow-y-auto">
          <Table className="table-fixed">
            <TableBody>
              {factura.items.map((item) => (
                <TableRow key={item.idProducto} className="border-b last:border-0 hover:bg-slate-50/50">
                  {/* PRODUCTO */}
                  <TableCell className={columnWidths.producto}>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 truncate">{item.producto}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatearNumeroProducto(item.idProducto)}
                      </span>
                    </div>
                  </TableCell>
                  {/* CANTIDAD */}
                  <TableCell className={`${columnWidths.cantidad} text-slate-700 font-medium`}>
                    {item.cantidad}
                  </TableCell>
                  {/* PRECIO UNITARIO */}
                  <TableCell className={columnWidths.precio}>
                    {formatGuaranies(item.precioUnitario)}
                  </TableCell>
                  {/* IVA */}
                  <TableCell className={`${columnWidths.iva} text-muted-foreground text-xs`}>
                    {formatGuaranies(item.totalIva)}
                  </TableCell>
                  {/* SUBTOTAL NETO */}
                  <TableCell className={`${columnWidths.subtotal} text-right font-bold text-slate-900`}>
                    {formatGuaranies(item.totalNeto)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* INFORMACIÓN DE TOTALES */}
      <div className="flex justify-end p-4 border rounded-b-md bg-slate-50/40 mb-8 shadow-sm">
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Facturado</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatGuaranies(totalGeneral)}
          </p>
        </div>
      </div>
    </>
  );
}