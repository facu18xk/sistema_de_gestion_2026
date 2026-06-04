"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { formatearNumeroNotaCredito } from "@/utils/nota-format";
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI";
import { facturasAPI } from "@/services/facturasAPI";
import { clientesAPI } from "@/services/clientesAPI";
import { estadosAPI } from "@/services/estadosAPI";
import { timbradosAPI } from "@/services/timbradosAPI";
import { Timbrado, Estado, NotaCreditoVenta, FacturaVentaCompleto, Cliente, NotaCreditoVentaSave } from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { formatPhone } from "@/utils/phone-format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/*const resNotaCredito = {
  "idNotaCreditoVenta": 0,
  "idFacturaVenta": 0,
  "facturaVenta": "string",
  "idEstado": 0,
  "estado": "string",
  "idNotaDevolucionVenta": 0,
  "notaDevolucionVenta": "string",
  "idTimbrado": 0,
  "timbrado": "string",
  "nroComprobante": "001-001-0000001",
  "motivo": "string",
  "fechaEmision": "2026-06-01T22:08:06.253Z",
  "total": 0,
  "detalles": [
    {
      "idNotaCreditoVentaDetalle": 0,
      "idNotaCreditoVenta": 0,
      "idProducto": 0,
      "producto": "Producto 1",
      "cantidad": 1,
      "precioUnitario": 5000,
      "subtotal": 5000
    },
    {
      "idNotaCreditoVentaDetalle": 0,
      "idNotaCreditoVenta": 0,
      "idProducto": 0,
      "producto": "Producto 2",
      "cantidad": 2,
      "precioUnitario": 5000,
      "subtotal": 10000
    },
    {
      "idNotaCreditoVentaDetalle": 0,
      "idNotaCreditoVenta": 0,
      "idProducto": 0,
      "producto": "Producto 3",
      "cantidad": 3,
      "precioUnitario": 5000,
      "subtotal": 15000
    },
    {
      "idNotaCreditoVentaDetalle": 0,
      "idNotaCreditoVenta": 0,
      "idProducto": 0,
      "producto": "Producto 4",
      "cantidad": 2,
      "precioUnitario": 5000,
      "subtotal": 10000
    }
  ]
}*/

export default function DetalleNotaCreditoPage() {
  const router = useRouter();
  const params = useParams();
  const idNotaCredito = Number(params.id);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [notaCredito, setNotaCredito] = useState<NotaCreditoVenta | null>(null);
  const [timbrado, setTimbrado] = useState<Timbrado | null>(null);
  const [facturaAsociada, setFacturaAsociada] = useState<FacturaVentaCompleto | null>(null);
  const [clienteAsociado, setClienteAsociado] = useState<Cliente | null>(null);
  const [isAnulado, setIsAnulado] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [idEstadoOriginal, setIdEstadoOriginal] = useState<number>(7);
  const [idEstadoNuevo, setIdEstadoNuevo] = useState<number>(7);

  const columnWidths = {
    producto: "w-[120px]",
    cantidad: "w-[120px]",
    precio: "w-[120px]",
    iva: "w-[120px]",
    subtotal: "w-[120px]",
  };

  useEffect(() => {
    const obtenerNotaCredito = async () => {
      try {
        setLoading(true);
        const resNotaCredito = await notasCreditosVentasAPI.getById(idNotaCredito);
        //console.log(resNotaCredito)
        if (resNotaCredito) {
          try {
            const resFactura = await facturasAPI.getById(resNotaCredito.idFacturaVenta);
            setFacturaAsociada(resFactura);
            if (resFactura) {
              try {
                const resCliente = await clientesAPI.getById(resFactura.idCliente);
                setClienteAsociado(resCliente);
              } catch(error) {
                console.error("Error al obtener el cliente asociado:", error);
                notify.error("Error de conexión", "No se pudo obtener los datos del cliente asociado.");
              }
            }
            const resTimbrado = await timbradosAPI.getById(2); //ID 2 = Notas de Crédito
            setTimbrado(resTimbrado);
          } catch(error) {
            console.error("Error al obtener la factura asociada:", error);
            notify.error("Error de conexión", "No se pudo obtener los datos de la factura asociada.");
          }
          setIdEstadoOriginal(resNotaCredito.idEstado);
          const anulado = resNotaCredito.idEstado === 8 ? true : false;
          setIsAnulado(anulado);
        }

        if (!resNotaCredito) {
          notify.error("Error", "La Nota de Crédito solicitada no existe.");
          router.push("/ventas/devoluciones");
          return;
        }
        setNotaCredito(resNotaCredito);
        console.log("NC:",resNotaCredito);
        const resEstados = await estadosAPI.getAll();
        const estadosFiltrados = resEstados.items.filter((e) => e.idEstado === 7 || e.idEstado === 8);
        estadosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        //console.log(estadosFiltrados)
        setEstados(estadosFiltrados);
      } catch (error) {
        console.error("Error al obtener la nota de crédito:", error);
        notify.error("Error de conexión", "No se pudieron cargar los datos de la nota de crédito.");
      } finally {
        setLoading(false);
      }
    };
    console.log("Original:", idEstadoOriginal);
    console.log("Nuevo:", idEstadoNuevo);
    if (idNotaCredito) obtenerNotaCredito();
  }, [idNotaCredito, router]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando comprobante de devolución...</div>;
  if (!notaCredito) return <div className="p-8 text-center text-muted-foreground">No se encontró el comprobante.</div>;

  const handleEditarNota = async () => {
      if (!notaCredito) return;
      setIsUpdating(true);
      const payload: NotaCreditoVentaSave = {
        idFacturaVenta: notaCredito.idFacturaVenta,
        idEstado: idEstadoNuevo,
        idTimbrado: notaCredito.idTimbrado,
        motivo: notaCredito.motivo,
        fechaEmision: notaCredito.fechaEmision,
        items: notaCredito.detalles
      };
      //console.log(payload)
      try {
            await notasCreditosVentasAPI.update(idNotaCredito, payload);
            notify.success("¡Nota de Crédito Actualizada!", "Todos los cambios se guardaron con éxito.");
            router.push("/ventas/devoluciones");
            router.refresh();
          } catch (error) {
            console.error("Error al actualizar la nota de crédito:", error);
            notify.error("Error", "No se pudieron registrar las modificaciones en el servidor.");
          } finally {
            setIsUpdating(false);
          }
    }

  const imprimirNotaCredito = () => {
      if (!notaCredito) return;
    
      // 1. Calculamos los totales necesarios para el pie de página
      const totalIvaAcumulado = notaCredito.detalles.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario * 0.1), 0);
      const totalNeto = notaCredito.detalles.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario * 1.1), 0);
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
          <title>NC ${notaCredito.nroComprobante}</title>
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
            .cliente-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
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
                <p><strong>Casa Central:</strong> Av. Bernardino Caballero & Av. Irrazábal</p>
                <p>Encarnación, Itapúa, Paraguay</p>
                <p><strong>Teléfono:</strong> +595 71 200000</p>
                <p><strong>Email:</strong> mcqueentires@gmail.com</p>
                <p style="font-weight: bold; margin-top: 5px;">RUC: 80012345-6</p>
              </div>
              <div class="header-timbrado">
                <p><strong>TIMBRADO N°:</strong> ${notaCredito.timbrado || "1654321"}</p>
                <p><strong><span class="data-label">Fecha Inicio:</strong></span> ${formatearFecha(fechaStart)}</p>
                <p><strong><span class="data-label">Fecha Fin:</strong></span> ${formatearFecha(fechaEnd)}</p>
                <div class="comprobante-titulo"><strong>Nota de Crédito</strong></div>
                <div class="comprobante-numero">${notaCredito.nroComprobante}</div>
                <div class="comprobante-titulo"><strong>Factura Asociada</strong></div>
                <div class="comprobante-numero">${facturaAsociada?.nroComprobante}</div>
              </div>
            </div>
    
            <div class="fila-cliente">
              <div class="cliente-titulo">Información del Cliente</div>
              <div class="cliente-grid">
                <div class="data-block">
                  <div class="data-label">Razón Social o Nombre</div>
                  <div class="data-value">${clienteAsociado?.nombres} ${clienteAsociado?.apellidos}</div>
                </div>
                <div class="data-block">
                  <div class="data-label">CI/RUC</div>
                  <div class="data-value">${clienteAsociado?.ruc ? formatRUC(clienteAsociado?.ruc) : formatCI(clienteAsociado?.ci)}</div>
                </div>
                <div class="data-block">
                  <div class="data-label">Correo</div>
                  <div class="data-value">${clienteAsociado?.correo || "Sin especificar"}</div>
                </div>
                <div class="data-block">
                  <div class="data-label">Telefono</div>
                  <div class="data-value">${formatPhone(clienteAsociado?.telefono) || "Sin especificar"}</div>
                </div>
                <div class="data-block">
                  <div class="data-label">Fecha de Emisión</div>
                  <div class="data-value">${formatearFecha(notaCredito.fechaEmision)}</div>
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
                  ${notaCredito.detalles.map(item => `
                    <tr>
                      <td>
                        <strong>${item.producto}</strong><br/>
                        <span style="font-size: 9px; color: #64748b; font-family: monospace;">${formatearNumeroProducto(item.idProducto)}</span>
                      </td>
                      <td>${item.cantidad}</td>
                      <td>${formatGuaranies(item.precioUnitario)}</td>
                      <td>${formatGuaranies(item.cantidad * item.precioUnitario * 0.1)}</td>
                      <td class="text-right" style="font-weight: bold;">${formatGuaranies(item.cantidad * item.precioUnitario * 1.1)}</td>
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
                <div class="total-valor">${formatGuaranies(totalNeto)}</div>
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
        { label: "Devoluciones", href: "/ventas/devoluciones" }, 
        { label: `Nota de Crédito ${notaCredito.nroComprobante}` }
      ]} />
      
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Nota de Crédito</h1>
      </div>
      {/* MODAL DIALOG CONFIRMACIÓN ANULACIÓN */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estas a punto de anular la factura <span className="font-bold text-foreground">{notaCredito.nroComprobante}</span>. Esta acción no se puede deshacer. ¿Estás completamente seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditarNota} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* CABECERA DE ACCIONES */}
      <div className="flex justify-between items-center my-2">
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Comprobante Oficial de Ajuste de Crédito al Cliente.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/ventas/devoluciones")}>
            <ArrowLeft className="h-4 w-4 mr-2"/> Volver al listado
          </Button>
          {!isAnulado && (<Button size="sm" variant="secondary" onClick={() => imprimirNotaCredito()} className="gap-2">
            <Printer className="h-4 w-4"/> Imprimir
          </Button>)}
          {!isAnulado && (<Button size="sm" variant="default" className="gap-2" onClick={() => setIsAlertOpen(true)} disabled={isUpdating || (idEstadoOriginal === idEstadoNuevo)}>
              <Save className="h-4 w-4"/> {isUpdating ? "Actualizando..." : "Actualizar"}
          </Button>)}
        </div>
      </div>

      {/* CABECERA DE DATOS EN MODO LECTURA */}
      <div className="p-4 border rounded-lg bg-slate-50/60 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* SECCIÓN 1: DATOS FISCALES DEL COMPROBANTE */}
          <div className="border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
            <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Identificación del Comprobante
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-muted-foreground text-[12px]">N° Nota de Crédito</p>
                <p className="font-bold text-slate-900 text-[13px]">
                  {notaCredito.nroComprobante}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Timbrado Asociado</p>
                <p className="font-medium text-slate-700 text-[13px]">
                  {notaCredito.timbrado || "---"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Fecha de Emisión</p>
                <p className="font-medium text-slate-700 text-[13px]">
                  {formatearFecha(notaCredito.fechaEmision)}
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: COMPROBANTES AFECTADOS */}
          <div className="border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
            <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Documentos de Referencia
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-muted-foreground text-[12px]">Factura Afectada</p>
                <p className="font-bold text-emerald-700 text-[13px] flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-emerald-600"/> {notaCredito.facturaVenta || `ID: ${notaCredito.idFacturaVenta}`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Razón Social/Cliente</p>
                <p className="font-medium text-slate-700 text-[13px]">
                  {facturaAsociada?.cliente}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">CI/RUC</p>
                <p className="font-medium text-slate-700 text-[13px]">
                  {clienteAsociado ? (clienteAsociado.ruc ? formatRUC(clienteAsociado.ruc) : formatCI(clienteAsociado.ci)) : "---"}
                </p>
              </div>
              {notaCredito.idNotaDevolucionVenta > 0 && (
                <div>
                  <p className="text-muted-foreground text-[12px]">Nota de Devolución Interna</p>
                  <p className="font-medium text-slate-700 text-[13px]">
                    {notaCredito.notaDevolucionVenta || `#${notaCredito.idNotaDevolucionVenta}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: MOTIVO COMERCIAL */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Concepto / Motivo de Emisión
            </p>
            <div className="bg-white border rounded p-2.5 text-[12px] shadow-sm italic min-h-[65px] text-slate-700 leading-relaxed mb-2">
              {notaCredito.motivo || "Sin justificación detallada."}
            </div>
            {/* ESTADO DE LA NOTA */}
            <div className="grid grid-col-1">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Estado de la Nota de Crédito
            </label>
            {notaCredito.idEstado === 8 ? (
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
          </div>

        </div>
      </div>

      {/* TABLA DE ITEMS DEVUELTOS */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex flex-col mt-4">
        {/* CABECERA TABLA */}
        <div className="bg-slate-100 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className={columnWidths.producto}>Producto Afectado</TableHead>
                <TableHead className={columnWidths.cantidad}>Cant. Devuelta</TableHead>
                <TableHead className={columnWidths.precio}>Precio Unitario</TableHead>
                <TableHead className={columnWidths.iva}>IVA</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        
        {/* CUERPO TABLA */}
        <div className="max-h-[350px] overflow-y-auto">
          <Table className="table-fixed">
            <TableBody>
              {/*notaCredito.detalles? */}
              {notaCredito.detalles.map((item) => (
                <TableRow key={item.idNotaCreditoVentaDetalle} className="border-b last:border-0 hover:bg-slate-50/50">
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
                  <TableCell className={`${columnWidths.cantidad} text-slate-700 font-semibold pl-4`}>
                    {item.cantidad} unids.
                  </TableCell>
                  {/* PRECIO UNITARIO */}
                  <TableCell className={columnWidths.precio}>
                    {formatGuaranies(item.precioUnitario)}
                  </TableCell>
                  {/* IVA */}
                  <TableCell className={columnWidths.iva}>
                    {formatGuaranies(item.cantidad * item.precioUnitario * 0.1)}
                  </TableCell>
                  {/* SUBTOTAL */}
                  <TableCell className={`${columnWidths.subtotal} text-right font-bold text-slate-900`}>
                    {formatGuaranies(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
              {(!notaCredito.detalles || notaCredito.detalles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    Este comprobante no cuenta con un desglose de ítems registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* INFORMACIÓN DE TOTALES */}
      <div className="flex justify-end p-4 border rounded-b-md bg-slate-50/40 mb-8 shadow-sm">
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Acreditado / Devuelto</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatGuaranies(notaCredito.total)}
          </p>
        </div>
      </div>
    </>
  );
}
