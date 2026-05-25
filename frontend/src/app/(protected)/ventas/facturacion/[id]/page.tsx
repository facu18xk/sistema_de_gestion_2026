"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format";
import { facturasAPI } from "@/services/facturasAPI";
import { formatearFecha } from "@/utils/date-utils";
import { FacturaVentaCompleto } from "@/types/types";

const res = {
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
};

export default function DetalleFacturaPage() {
  const router = useRouter();
  const params = useParams();
  const idFactura = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [factura, setFactura] = useState<FacturaVentaCompleto | null>(null);

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
        //const res = await facturasAPI.getById(idFactura); 
        
        if (!res) {
          notify.error("Error", "La factura solicitada no existe.");
          router.push("/ventas/facturacion");
          return;
        }
        setFactura(res);
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

  return (
    <>
      <PageBreadcrumb steps={[
        { label: "Ventas", href: "#" }, 
        { label: "Facturación", href: "/ventas/facturacion" }, 
        { label: `Comprobante N° ${factura.nroComprobante}` }
      ]} />
      
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-slate-500" />
        <h1 className="text-xl font-bold tracking-tight">Factura de Venta Emitida</h1>
      </div>

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
          <Button size="sm" variant="secondary" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4"/> Imprimir
          </Button>
        </div>
      </div>

      {/* CABECERA DE DATOS */}
      <div className="p-4 border rounded-lg bg-slate-50/60 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          
          {/* DATOS CLIENTE */}
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Datos del Cliente
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <p className="text-muted-foreground text-[12px]">Razón Social / Cliente</p>
                <p className="font-bold text-slate-900 text-[13px]">{factura.cliente || "Sin especificar"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">N° Comprobante</p>
                <p className="font-bold text-emerald-700 text-[13px]">{factura.nroComprobante}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Timbrado N°</p>
                <p className="font-medium text-slate-800 text-[13px]">{factura.timbrado} <span className="text-xs text-muted-foreground">({factura.timbradoRuc})</span></p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Fecha de Emisión</p>
                <p className="font-medium text-slate-700 text-[13px]">{formatearFecha(factura.fecha)}</p>
              </div>
            </div>
          </div>

          {/* MEDIO PAGO Y DESCRIPCIÓN*/}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Medio de Pago</p>
              <p className="font-semibold text-slate-800 bg-white border rounded px-2.5 py-1 text-[13px] shadow-sm inline-block w-full">
                {factura.medioPagoCompra || "Efectivo"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Descripción Interna</p>
              <p className="text-slate-700 bg-white border rounded px-2.5 py-1 text-[12px] shadow-sm italic min-h-[30px] flex items-center">
                {factura.descripcion || "Sin observaciones."}
              </p>
            </div>
          </div>

          {/* ESTADO DE LA FACTURA */}
          <div className="flex flex-col justify-start h-full md:items-end md:pl-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Estado de Factura</span>
            <div className="w-full md:w-auto">
              <span className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 border border-green-200 shadow-sm w-full md:w-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                Vigente / Emitida
              </span>
            </div>
          </div>

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
                <TableHead className={columnWidths.iva}>IVA Liquidado</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal (Neto)</TableHead>
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