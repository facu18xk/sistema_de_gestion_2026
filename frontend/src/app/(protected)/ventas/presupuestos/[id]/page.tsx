"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Save, Plus, Trash2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { esPresupuestoVigente, formatearFecha } from "@/utils/date-utils";
import { Cliente, PresupuestoCompleto, PresupuestoCompletoSave, PresupuestoCabeceraSave, Estado, ProductoDTO, PresupuestoItem, PreciosVentas } from "@/types/types";
import { presupuestosAPI } from "@/services/presupuestosAPI";
import { clientesAPI } from "@/services/clientesAPI";
import { estadosAPI } from "@/services/estadosAPI";
import { productosAPI } from "@/services/productosAPI";
import { preciosVentasAPI } from "@/services/preciosVentasAPI";
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format";
import { ProductoSelector } from "@/components/ventas/ProductoSelector";
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { formatPhone } from "@/utils/phone-format";

export default function VerPresupuestoPage() {
  const params = useParams();
  const idPresupuesto = Number(params.id); 
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [presupuesto, setPresupuesto] = useState<PresupuestoCompleto | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [listaEstados, setListaEstados] = useState<Estado[]>([]);
  const [listaProductos, setListaProductos] = useState<ProductoDTO[]>([]);
  const [listaPrecios, setListaPrecios] = useState<PreciosVentas[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [indexAEliminar, setIndexAEliminar] = useState<number>(-1);
  const [itemAEliminarDescripcion, setItemAEliminarDescripcion] = useState("");
  const [idEstadoSeleccionado, setIdEstadoSeleccionado] = useState<number>(1);
  const [itemsCarrito, setItemsCarrito] = useState<PresupuestoItem[]>([]);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [esEditable, setEsEditable] = useState(false);
  const [esAprobado, setEsAprobado] = useState(false);
  const [estaExpirado, setEstaExpirado] = useState(false);

  const columnWidths = {
    producto: "w-[35%]",
    cantidad: "w-[100px]",
    precio: "w-[120px]",
    iva: "w-[80px]",
    subtotal: "w-[130px]",
    acciones: "w-[80px]",
  };

  useEffect(() => {
    const cargarDatosPantalla = async () => {
      if (!idPresupuesto) return;
      try {
        setLoading(true);
        //Cargamos el presupuesto
        const resPresupuesto = await presupuestosAPI.getById(idPresupuesto);
        setPresupuesto(resPresupuesto);
        //console.log(resPresupuesto);
        if (resPresupuesto) {
          //Estado actual del presupuesto
          setIdEstadoSeleccionado(resPresupuesto.idEstado);
          //Cargamos los productos del presupuesto
          setItemsCarrito(resPresupuesto.items);
          //Verificamos la vigencia del presupuesto
          const permiteEditar = resPresupuesto.idEstado === 1 && esPresupuestoVigente(resPresupuesto.fechaVencimiento);
          setEsEditable(permiteEditar);
          const permiteFacturar = resPresupuesto.idEstado === 2 ? true : false;
          setEsAprobado(permiteFacturar);
          //Cargamos los datos del cliente
          if (resPresupuesto.idCliente) {
            const resCliente = await clientesAPI.getById(resPresupuesto.idCliente);
            setCliente(resCliente);
          }
        }
        //Cargamos los estados
        const resEstados = await estadosAPI.getAll();
        const toRemove = ['Enviado', 'Respondido', 'Expirado', 'Pagado', 'Anulado', 'Emitido', 'Facturado', 'Registrado', 'Completado'];
        const estadosFiltrados = resEstados.items.filter(item => !toRemove.includes(item.nombre));
        setListaEstados(estadosFiltrados);
        //Cargamos los productos disponibles
        const resProductos = await productosAPI.getAll(1, 300);
        setListaProductos(resProductos.items);
        //Cargamos lista de precios para venta
        const resPrecios = await preciosVentasAPI.getAll(1, 300);
        setListaPrecios(resPrecios.items);
      } catch (error) {
        console.error("Error al cargar los datos de la vista:", error);
        notify.error("Error de carga", "No se pudieron recuperar los datos completos.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatosPantalla();
  }, [idPresupuesto]);

  const agregarAlCarrito = (producto: ProductoDTO) => {
    setItemsCarrito(prev => {
      const existe = prev.find(item => item.idProducto === producto.idProducto);
      if (existe) {
        return prev.map(item => 
          item.idProducto === producto.idProducto 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      }
      return [...prev, {
        idProducto: producto.idProducto,
        producto: producto.descripcion,
        cantidad: 1,
        precioUnitario: producto.precioUnitario,
        iva: producto.porcentajeIva,
        subtotal: (1 * producto.precioUnitario) * ((producto.porcentajeIva / 100) + 1)
      }];
    });
    setIsProductoModalOpen(false);
  };

  const updateCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    setItemsCarrito(prev => {
      const nuevoCarrito = [...prev];
      nuevoCarrito[index] = { ...nuevoCarrito[index], cantidad: nuevaCantidad };
      return nuevoCarrito;
    });
  };

  const abrirConfirmarEliminar = (index: number, descripcion: string) => {
    setIndexAEliminar(index);
    setItemAEliminarDescripcion(descripcion);
    setIsAlertOpen(true);
  };

  const ejecutarEliminacion = () => {
    setItemsCarrito(prev => prev.filter((_, i) => i !== indexAEliminar));
    setIsAlertOpen(false);
    setIndexAEliminar(-1);
  };

  const handleActualizarPresupuesto = async () => {
    if (!presupuesto) return;
    if (itemsCarrito.length === 0) {
      notify.error("Tabla vacía", "Debe agregar al menos un producto al presupuesto.");
      return;
    }
    setIsUpdating(true);
    const payload: PresupuestoCompletoSave = {
      idCliente: presupuesto.idCliente,
      idEstado: idEstadoSeleccionado,
      fecha: presupuesto.fecha.split('T')[0], // Mantiene YYYY-MM-DD
      descripcion: presupuesto.descripcion,
      fechaVencimiento: presupuesto.fechaVencimiento.split('T')[0],
      items: itemsCarrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };
    
    try {
      await presupuestosAPI.update(idPresupuesto, payload);
      notify.success("¡Presupuesto Actualizado!", "Todos los cambios se guardaron con éxito.");
      router.push("/ventas/presupuestos");
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar el presupuesto:", error);
      notify.error("Error", "No se pudieron registrar las modificaciones en el servidor.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando datos del presupuesto...</div>;
  }

  if (!presupuesto) {
    return <div className="p-8 text-center text-destructive">No se encontró el presupuesto solicitado.</div>;
  }

  const totalGeneral = itemsCarrito.reduce(
    (acc, item) => acc + ((item.cantidad * item.precioUnitario) * ((item.iva/100) + 1)), 0
  );

  const imprimirPresupuesto = () => {
    if (!presupuesto) return;
  
    // 1. Calculamos los totales necesarios para el pie de página
    const totalBruto = presupuesto.items.reduce((acc, item) => {
      return acc + ((item.cantidad * item.precioUnitario));
    }, 0);
    const totalIvaAcumulado = presupuesto.items.reduce((acc, item) => {
      return acc + ((item.cantidad * item.precioUnitario) * (item.iva / 100));
    }, 0);
    const totalPresupuestado = presupuesto.items.reduce((acc, item) => {
      return acc + ((item.cantidad * item.precioUnitario) * ((item.iva / 100) + 1));
    }, 0);
  
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
        <title>Presupuesto ${formatearNumeroPresupuesto(presupuesto.idPresupuesto)}</title>
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
          .cliente-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
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
              <p><strong>PRESUPUESTO:</strong> ${formatearNumeroPresupuesto(presupuesto.idPresupuesto)}</p>
              <p><span class="data-label"><strong>Fecha Emisión:</strong></span> ${formatearFecha(presupuesto.fecha) || "80012345-6"}</p>
              <p><span class="data-label"><strong>Fecha Vencimiento:</strong></span> ${formatearFecha(presupuesto.fechaVencimiento)}</p>
            </div>
          </div>
  
          <div class="fila-cliente">
            <div class="cliente-titulo">Información del Cliente</div>
            <div class="cliente-grid">
              <div class="data-block">
                <div class="data-label">Razón Social o Nombre</div>
                <div class="data-value">${presupuesto.cliente || "Sin especificar"}</div>
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
            </div>
          </div>
  
          <div class="fila-detalles">
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Descripción del Producto</th>
                  <th style="width: 10%;">Cantidad</th>
                  <th style="width: 15%;">Precio Unitario</th>
                  <th style="width: 15%;">Subtotal IVA</th>
                  <th style="width: 15%; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${presupuesto.items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.producto}</strong><br/>
                      <span style="font-size: 9px; color: #64748b; font-family: monospace;">${formatearNumeroProducto(item.idProducto)}</span>
                    </td>
                    <td>${item.cantidad}</td>
                    <td>${formatGuaranies(item.precioUnitario)}</td>
                    <td>${formatGuaranies(item.cantidad * item.precioUnitario * (item.iva/100))}</td>
                    <td class="text-right" style="font-weight: bold;">${formatGuaranies(item.cantidad * item.precioUnitario *((item.iva/100) + 1))}</td>
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
              <span><strong>Total Bruto:</strong> ${formatGuaranies(totalBruto)}</span>
            </div>
            <div class="total-monto">
              <div class="total-label">Total Presupuestado</div>
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
      {/* BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Presupuestos", href: "/ventas/presupuestos" }, { label: `Presupuesto ${formatearNumeroPresupuesto(idPresupuesto)}` }]} />
      {/* MODAL DIALOG CONFIRMACIÓN ELIMINAR */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Retirar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Quitarás <span className="font-bold text-foreground">"{itemAEliminarDescripcion}"</span> del desglose del presupuesto actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={ejecutarEliminacion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Quitar Producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* ACCIONES DE CABECERA */}
      <div className="flex justify-between items-center my-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Presupuesto {formatearNumeroPresupuesto(idPresupuesto)}</h1>
          <p className="text-xs text-muted-foreground">{presupuesto.descripcion}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push("/ventas/presupuestos")}>
            <ArrowLeft className="h-4 w-4"/> Volver
          </Button>
          <Button size="sm" variant="secondary" className="gap-2" onClick={() => imprimirPresupuesto()}>
            <Printer className="h-4 w-4"/> Imprimir
          </Button>
          {esEditable && (
            <Button size="sm" variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleActualizarPresupuesto} disabled={isUpdating}>
              <Save className="h-4 w-4"/> {isUpdating ? "Actualizando..." : "Actualizar"}
            </Button>
          )}
          {esAprobado && (<Button
            size="sm"
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              router.push(`/ventas/facturacion/nuevo?presupuestoId=${presupuesto.idPresupuesto}`)
              notify.success("Procesando", "Iniciando la generación de la Factura...");
            }}
          >
              <ReceiptText className="h-4 w-4"/> {"Generar Factura"}
          </Button>)}
        </div>
      </div>
      {/* CABECERA DE DATOS */}
      <div className="p-3 border rounded-lg bg-slate-50/40 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* DATOS DEL CLIENTE */}
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Datos del Cliente
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              <div>
                <p className="text-muted-foreground text-[13px]">Razón Social</p>
                <p className="font-semibold text-slate-900 truncate text-[13px]">
                  {cliente ? `${cliente.nombres} ${cliente.apellidos}` : "Cargando cliente..."}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[13px]">Documento (CI/RUC)</p>
                <p className="font-medium text-slate-800 text-[13px]">
                  {cliente ? (cliente.ruc ? `RUC: ${formatRUC(cliente.ruc)}` : `CI: ${formatCI(cliente.ci)}`) : "---"}
                </p>
              </div>
              <div className="truncate">
                <p className="text-muted-foreground text-[13px]">Email</p>
                <p className="font-medium text-slate-700 truncate text-[13px]">{cliente?.correo || "No registrado"}</p>
              </div>
              {/*<div>
                <p className="text-muted-foreground text-[13px]">Fecha Nacimiento</p>
                <p className="font-medium text-slate-700 text-[13px]">
                  {cliente ? formatearFecha(cliente.fechaNacimiento) : "---"}
                </p>
              </div>*/}
            </div>
          </div>
          {/* DATOS PRESUPUESTO */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estado del Presupuesto
            </label>
            {presupuesto.idEstado === 5 ? (
              <span className="inline-flex items-center justify-start rounded-full bg-white px-3 py-1.5 text-sm font-bold text-red-500 border shadow-sm w-full md:w-auto">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                  Expirado
              </span>
              ) : presupuesto.idEstado === 9 ? (
              <span className="inline-flex items-center justify-start rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-500 border shadow-sm w-full md:w-auto">
                <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                  Facturado
              </span>
              ): (
              <Select
              value={String(idEstadoSeleccionado)}
              onValueChange={(val) => setIdEstadoSeleccionado(Number(val))}
              disabled={!esEditable || isUpdating}
              >
                <SelectTrigger className="w-full h-8 bg-white shadow-sm text-sm mt-0.5">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {listaEstados.map((est) => (
                    <SelectItem key={est.idEstado} value={String(est.idEstado)} className="text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        est.idEstado === 1 ? "bg-yellow-400" : 
                        est.idEstado === 2 ? "bg-green-500" : 
                        est.idEstado === 6 ? "bg-red-500" : "bg-red-400"
                      }`} />
                      {est.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>)}
          </div>
          <div className="flex flex-col gap-1 md:pl-2">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
              Vigencia
            </p>
            <div className="space-y-1 bg-white border rounded px-2 py-1 text-[11px] shadow-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground text-[13px]">Emisión:</span>
                <span className="font-semibold text-slate-700 text-[13px]">{formatearFecha(presupuesto.fecha)}</span>
              </div>
              <div className="flex justify-between items-center gap-2 border-t pt-1">
                <span className="text-muted-foreground text-[13px]">Vencimiento:</span>
                <span className="font-bold text-amber-700 text-[13px]">{formatearFecha(presupuesto.fechaVencimiento)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* SELECTOR MODAL DE PRODUCTOS */}
      <ProductoSelector 
        isOpen={isProductoModalOpen}
        onClose={() => setIsProductoModalOpen(false)}
        onSelect={agregarAlCarrito}
        productos={listaProductos}
        precios={listaPrecios}
      />
      {esEditable && (
        <div className="mt-3 flex justify-end">
          <Button variant="default" className="h-8 gap-2 cursor-pointer" onClick={() => setIsProductoModalOpen(true)}>
            <Plus className="h-4 w-4"/> Agregar
          </Button>
        </div>
      )}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex flex-col mt-2">
        {/* CABECERA TABLA */}
        <div className="bg-slate-50 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className={columnWidths.producto}>Producto</TableHead>
                <TableHead className={columnWidths.cantidad}>Cantidad</TableHead>
                <TableHead className={columnWidths.precio}>Precio Unitario</TableHead>
                <TableHead className={columnWidths.iva}>IVA</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal</TableHead>
                {esEditable && <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* CUERPO TABLA (CON SCROLL) */}
        <div className="max-h-[215px] overflow-y-auto">
          <Table className="table-fixed">
            <TableBody>
              {itemsCarrito.map((item, index) => {
                const subtotal = (item.cantidad * item.precioUnitario) * ((item.iva / 100) + 1);
                return (
                  <TableRow key={item.idProducto} className="border-b last:border-0 hover:bg-slate-50/50">
                    {/* DESCRIPCIÓN E ID */}
                    <TableCell className={columnWidths.producto}>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate">{item.producto}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatearNumeroProducto(item.idProducto)}
                        </span>
                      </div>
                    </TableCell>
                    {/* CANTIDAD */}
                    <TableCell className={columnWidths.cantidad}>
                      {esEditable ? (<Input 
                        type="number" 
                        min="1"
                        className="w-16 h-8 px-2"
                        value={item.cantidad} 
                        onChange={(e) => updateCantidad(index, Number(e.target.value))} 
                      />) : (
                        <span className="font-semibold pl-2">{item.cantidad}</span>
                      )}
                    </TableCell>
                    {/* PRECIO UNITARIO */}
                    <TableCell className={columnWidths.precio}>
                      {formatGuaranies(item.precioUnitario)}
                    </TableCell>
                    {/* %IVA */}
                    <TableCell className={columnWidths.iva}>
                      {item.iva}%
                    </TableCell>
                    {/* SUBTOTAL */}
                    <TableCell className={`${columnWidths.subtotal} text-right font-bold text-slate-900`}>
                      {formatGuaranies(subtotal)}
                    </TableCell>
                    {/* ACCIONES */}
                    {esEditable && (
                      <TableCell className={`${columnWidths.acciones} text-right`}>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => abrirConfirmarEliminar(index, item.producto)}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {/* CARRITO VACÍO */}
              {itemsCarrito.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground italic text-sm">
                    No quedan productos en este presupuesto. Agregue nuevos elementos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* INFORMACIÓN ÚTIL */}
      <div className="flex justify-end p-4 border rounded-b-md bg-slate-50/30">
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Presupuestado</p>
          <p className="text-2xl font-black text-primary mt-1">
            {formatGuaranies(totalGeneral)}
          </p>
        </div>
      </div>
    </>
  );
}