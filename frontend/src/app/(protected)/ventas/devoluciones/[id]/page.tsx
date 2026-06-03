"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, ReceiptText, Calendar, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { formatearNumeroNotaCredito } from "@/utils/nota-format";
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI";
import { NotaCreditoVenta, NotaCreditoVentaItem, NotaCreditoVentaDetalle } from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";

export default function DetalleNotaCreditoPage() {
  const router = useRouter();
  const params = useParams();
  const idNotaCredito = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [notaCredito, setNotaCredito] = useState<NotaCreditoVenta | null>(null);

  //Mientras
  const [detalles, setDetalles] = useState<NotaCreditoVentaDetalle[]>([]);

  const columnWidths = {
    producto: "w-[45%]",
    cantidad: "w-[120px]",
    precio: "w-[150px]",
    subtotal: "w-[150px]",
  };

  useEffect(() => {
    const obtenerNotaCredito = async () => {
      try {
        setLoading(true);
        const res = await notasCreditosVentasAPI.getById(idNotaCredito);
        //Mientras
        const det = await notasCreditosVentasAPI.getAllDetails();
        const filtrados = det.items.filter((n) => {n.idNotaCreditoVenta === idNotaCredito});
        setDetalles(filtrados)
        console.log("filtered: ",filtrados)

        if (!res) {
          notify.error("Error", "La Nota de Crédito solicitada no existe.");
          router.push("/ventas/devoluciones");
          return;
        }
        setNotaCredito(res);
        console.log("NC:",res);
      } catch (error) {
        console.error("Error al obtener la nota de crédito:", error);
        notify.error("Error de conexión", "No se pudieron cargar los datos de la nota de crédito.");
      } finally {
        setLoading(false);
      }
    };

    if (idNotaCredito) obtenerNotaCredito();
  }, [idNotaCredito, router]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando comprobante de devolución...</div>;
  if (!notaCredito) return <div className="p-8 text-center text-muted-foreground">No se encontró el comprobante.</div>;

  return (
    <>
      {/* BREADCRUMB */}
      <PageBreadcrumb steps={[
        { label: "Ventas", href: "#" }, 
        { label: "Devoluciones", href: "/ventas/devoluciones" }, 
        { label: `Nota de Crédito ${formatearNumeroNotaCredito(notaCredito.idNotaCreditoVenta)}` }
      ]} />
      
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">Nota de Crédito / Devolución</h1>
      </div>

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
          <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4"/> Imprimir
          </Button>
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
                  {formatearNumeroNotaCredito(notaCredito.idNotaCreditoVenta)}
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
            <div className="bg-white border rounded p-2.5 text-[12px] shadow-sm italic min-h-[65px] text-slate-700 leading-relaxed">
              {notaCredito.motivo || "Sin justificación detallada."}
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
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal Ajustado</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        
        {/* CUERPO TABLA */}
        <div className="max-h-[350px] overflow-y-auto">
          <Table className="table-fixed">
            <TableBody>
              {/*notaCredito.detalles? */}
              {detalles.map((item) => (
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
                  {/* SUBTOTAL */}
                  <TableCell className={`${columnWidths.subtotal} text-right font-bold text-slate-900`}>
                    {formatGuaranies(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
              {(!notaCredito.detalles || notaCredito.detalles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground text-sm">
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