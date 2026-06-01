"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { FacturaSelector } from "@/components/ventas/FacturaSelector";  // Asegúrate de crear este componente similar a PresupuestoSelector
import { ProductoSelector } from "@/components/ventas/ProductoSelector";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { formatearNumeroFactura } from "@/utils/factura-format";
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format";
import { facturasAPI } from "@/services/facturasAPI";
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI";
import { FacturaVentaCabecera, FacturaVentaCompleto, NotaCreditoVentaSave, ProductoDTO, PreciosVentas } from "@/types/types";
import { formatearFecha } from "@/utils/date-utils";
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
import { esVigenteParaNotaCredito } from "@/utils/date-utils";

function NuevaDevolucionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFacturaQuery = searchParams.get("facturaId");
  const idFacturaUrl = idFacturaQuery ? Number(idFacturaQuery) : null;

  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);

  // Datos maestros para selección manual
  const [listaFacturas, setListaFacturas] = useState<FacturaVentaCabecera[]>([]);
  
  // Factura activa seleccionada (completa)
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<FacturaVentaCompleto | null>(null);
  
  // Estado del formulario de Nota de Crédito
  const [motivo, setMotivo] = useState("");
  const [itemsDevolucion, setItemsDevolucion] = useState<any[]>([]); // Items agregados a devolver

  // Alertas de eliminación
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [indexAEliminar, setIndexAEliminar] = useState<number>(-1);

  const columnWidths = {
    producto: "w-[40%]",
    cantFacturada: "w-[120px]",
    cantDevolver: "w-[120px]",
    precio: "w-[130px]",
    subtotal: "w-[130px]",
    acciones: "w-[70px]",
  };

  useEffect(() => {
    const inicializarPantalla = async () => {
      try {
        setLoading(true);

        if (idFacturaUrl) {
          // Modo 1: Redirigido directamente desde una Factura
          const resFactura = await facturasAPI.getById(idFacturaUrl);
          if (!resFactura) {
            notify.error("Error", "La factura especificada en la URL no existe.");
            router.push("/ventas/devoluciones/nuevo");
            return;
          }
          setFacturaSeleccionada(resFactura);
        } else {
          // Modo 2: Ingreso manual, cargar lista de facturas para el selector
          const resFacturas = await facturasAPI.getAll(1, 200); // Trae las últimas facturas emitidas
          const facturasVigentes = resFacturas.items.filter((f) => esVigenteParaNotaCredito(f.fechaPago));
          //setListaFacturas(resFacturas.items);
          setListaFacturas(facturasVigentes);
        }
      } catch (error) {
        console.error("Error al inicializar la devolución:", error);
        notify.error("Error de conexión", "No se pudieron cargar los datos iniciales.");
      } finally {
        setLoading(false);
      }
    };

    inicializarPantalla();
  }, [idFacturaUrl]);

  // Maneja la importación manual de una factura desde el selector en pantalla
  const handleSeleccionarFactura = async (id: number) => {
    try {
      setIsImporting(true);
      const resFactura = await facturasAPI.getById(id);
      if (resFactura) {
        setFacturaSeleccionada(resFactura);
        setItemsDevolucion([]); // Limpiar carrito anterior si cambia de factura
        notify.success("Factura Cargada", `Se importaron los datos del comprobante ${resFactura.nroComprobante}`);
      }
    } catch (error) {
      console.error("Error al importar factura:", error);
      notify.error("Error", "No se pudieron obtener los detalles de la factura seleccionada.");
    } finally {
      setIsImporting(false);
    }
  };

  // Mapea los productos de la factura al formato esperado por el ProductoSelector
  const obtenerProductosFiltrados = (): ProductoDTO[] => {
    if (!facturaSeleccionada) return [];
    return facturaSeleccionada.items.map(item => ({
      idProducto: item.idProducto,
      descripcion: item.producto,
      precioUnitario: item.precioUnitario,
      esServicio: false,
      porcentajeIva: 10, // Puedes estimarlo o mapearlo según tu lógica (ej: item.totalIva > 0 ? 10 : 0)
      cantidadTotal: item.cantidad, // Usamos "cantidadTotal" temporalmente para guardar el tope máximo facturado
      idMarca: 0,
      marca: "",
      idCategoria: 0,
      categoria: "",
    }));
  };

  const agregarAlCarritoDevolucion = (prodMapeado: ProductoDTO) => {
    // Buscamos cuánto se compró originalmente en la factura
    const itemOriginal = facturaSeleccionada?.items.find(i => i.idProducto === prodMapeado.idProducto);
    const maxCantFacturada = itemOriginal ? itemOriginal.cantidad : 0;

    setItemsDevolucion(prev => {
      const existe = prev.find(item => item.idProducto === prodMapeado.idProducto);
      if (existe) {
        if (existe.cantidad + 1 > maxCantFacturada) {
          notify.error("Límite superado", `No puedes devolver más de las ${maxCantFacturada} unidades facturadas.`);
          return prev;
        }
        return prev.map(item =>
          item.idProducto === prodMapeado.idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, {
        idProducto: prodMapeado.idProducto,
        producto: prodMapeado.descripcion,
        cantidadFacturada: maxCantFacturada,
        cantidad: 1,
        precioUnitario: prodMapeado.precioUnitario,
        totalNeto: prodMapeado.precioUnitario // inicial (1 unidad)
      }];
    });
    setIsProductoModalOpen(false);
  };

  const updateCantidadDevolver = (index: number, nuevaCantidad: number) => {
    const item = itemsDevolucion[index];
    if (!item || nuevaCantidad < 1) return;

    if (nuevaCantidad > item.cantidadFacturada) {
      notify.error(
        "Cantidad Inválida", 
        `La cantidad a devolver (${nuevaCantidad}) supera la cantidad comprada en la factura (${item.cantidadFacturada}).`
      );
      return;
    }

    setItemsDevolucion(prev => {
      const nuevo = [...prev];
      nuevo[index] = { 
        ...nuevo[index], 
        cantidad: nuevaCantidad,
        totalNeto: nuevaCantidad * item.precioUnitario
      };
      return nuevo;
    });
  };

  const handleGuardarNotaCredito = async () => {
    if (!facturaSeleccionada) {
      notify.error("Requerido", "Debe seleccionar una factura base.");
      return;
    }
    if (!motivo.trim()) {
      notify.error("Campo Obligatorio", "Por favor, introduzca el motivo de la devolución.");
      return;
    }
    if (itemsDevolucion.length === 0) {
      notify.error("Carrito vacío", "Debe añadir al menos un producto a devolver.");
      return;
    }

    setIsSubmitting(true);
    const fechaHoy = new Date().toISOString().split('T')[0];

    const payload: NotaCreditoVentaSave = {
      idFacturaVenta: facturaSeleccionada.idFacturaVenta,
      idTimbrado: 1, //Cuidado con este ID
      motivo: motivo.trim(),
      fechaEmision: fechaHoy,
      items: itemsDevolucion.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };

    try {
      await notasCreditosVentasAPI.create(payload);
      notify.success("¡Nota de Crédito Creada!", "La devolución se ha procesado exitosamente.");
      router.push("/ventas/devoluciones");
    } catch (error) {
      console.error("Error al crear nota de crédito:", error);
      notify.error("Error", "Hubo un fallo en el servidor al guardar la nota de crédito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando módulos de devoluciones...</div>;

  const totalDevolucion = itemsDevolucion.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  return (
    <>
      <PageBreadcrumb steps={[
        { label: "Ventas", href: "#" }, 
        { label: "Devoluciones", href: "/ventas/devoluciones" }, 
        { label: "Nueva Nota de Crédito" }
      ]} />
      <h1 className="text-xl font-bold tracking-tight">Emitir Nota de Crédito</h1>

      {/* CONFIRMACIÓN ELIMINAR ÍTEM */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar producto de la devolución?</AlertDialogTitle>
            <AlertDialogDescription>Este ítem ya no formará parte de la nota de crédito.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setItemsDevolucion(prev => prev.filter((_, i) => i !== indexAEliminar));
                setIsAlertOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BARRA DE ACCIONES SUPERIOR */}
      <div className="flex justify-between items-center my-2">
        <div>
        {facturaSeleccionada && (
            <p className="text-xs text-muted-foreground">Generada a partir de la Factura {formatearNumeroFactura(facturaSeleccionada.idFacturaVenta)}</p>
        )}
          {!idFacturaUrl && (
            <div className="w-[380px] flex items-center gap-2">
              <FacturaSelector 
                facturas={listaFacturas} 
                onSelectFactura={handleSeleccionarFactura}
                selectedFacturaId={facturaSeleccionada?.idFacturaVenta}
              />
              {isImporting && <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2"/> Volver
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleGuardarNotaCredito} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2"/> {isSubmitting ? "Guardando..." : "Emitir Comprobante"}
          </Button>
        </div>
      </div>

      {/* CABECERA DE DATOS VINCULADOS */}
      <div className="p-4 border rounded-lg bg-slate-50/50 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMNA 1: CLIENTE */}
          <div>
            <p className="text-[12px] font-bold uppercase text-muted-foreground mb-1.5">Datos del Cliente</p>
            <p className="text-slate-500 text-[13px]">Razón Social:</p>
            <p className="font-bold text-slate-900 text-[13px] mb-1">{facturaSeleccionada?.cliente || "---"}</p>
          </div>

          {/* COLUMNA 2: FACTURA ORIGEN */}
          <div>
            <p className="text-[12px] font-bold uppercase text-muted-foreground mb-1.5">Factura de Referencia</p>
            <p className="text-slate-500 text-[13px]">N° Comprobante:</p>
            <p className="font-bold text-emerald-700 text-[13px] mb-1">
              {facturaSeleccionada ? facturaSeleccionada.nroComprobante : "Seleccione una factura"}
            </p>
            {facturaSeleccionada && facturaSeleccionada.idPresupuesto > 0 && (
              <p className="text-[12px] text-muted-foreground">
                Emigrada del Presupuesto: {formatearNumeroPresupuesto(facturaSeleccionada.idPresupuesto)}
              </p>
            )}
          </div>

          {/* COLUMNA 3: MOTIVO DE LA NOTA DE CRÉDITO */}
          <div>
            <label className="text-[12px] font-bold uppercase text-muted-foreground block mb-1">
              Motivo o Concepto de Devolución <span className="text-destructive">*</span>
            </label>
            <Input 
              placeholder="Ej: Productos dañados / Error en cantidad..."
              value={motivo} 
              onChange={(e) => setMotivo(e.target.value)} 
              className="h-8 bg-white text-sm"
              disabled={!facturaSeleccionada}
            />
          </div>

        </div>
      </div>

      {/* PRODUCTO SELECTOR FILTRADO */}
      <ProductoSelector 
        isOpen={isProductoModalOpen}
        onClose={() => setIsProductoModalOpen(false)}
        onSelect={agregarAlCarritoDevolucion}
        productos={obtenerProductosFiltrados()} // ¡Filtrados! Sólo los de la factura
        precios={[]} // No requerimos lista de precios extras porque el item ya trae su precio unitario mapeado
      />

      <div className="mt-4 flex justify-end">
        <Button 
          variant="default" 
          size="sm"
          className="h-8 gap-2" 
          onClick={() => setIsProductoModalOpen(true)}
          disabled={!facturaSeleccionada}
        >
          <Plus className="h-4 w-4"/> Seleccionar Producto a Devolver
        </Button>
      </div>

      {/* TABLA DE DEVOLUCIONES */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="bg-slate-50 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className={columnWidths.producto}>Producto</TableHead>
                <TableHead className={columnWidths.cantFacturada}>Cant. Comprada</TableHead>
                <TableHead className={columnWidths.cantDevolver}>Cant. Devolver</TableHead>
                <TableHead className={columnWidths.precio}>Precio Unitario</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal</TableHead>
                <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        
        <div className="max-h-[250px] overflow-y-auto">
          <Table className="table-fixed">
            <TableBody>
              {itemsDevolucion.map((item, index) => (
                <TableRow key={item.idProducto} className="border-b last:border-0 hover:bg-slate-50/50">
                  <TableCell className={columnWidths.producto}>
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{item.producto}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatearNumeroProducto(item.idProducto)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={`${columnWidths.cantFacturada} text-slate-500 font-medium pl-4`}>
                    {item.cantidadFacturada} unids.
                  </TableCell>
                  <TableCell className={columnWidths.cantDevolver}>
                    <Input 
                      type="number" 
                      min="1"
                      max={item.cantidadFacturada}
                      className="w-20 h-8 px-2"
                      value={item.cantidad} 
                      onChange={(e) => updateCantidadDevolver(index, Number(e.target.value))} 
                    />
                  </TableCell>
                  <TableCell className={columnWidths.precio}>
                    {formatGuaranies(item.precioUnitario)}
                  </TableCell>
                  <TableCell className={`${columnWidths.subtotal} text-right font-bold text-slate-900`}>
                    {formatGuaranies(item.totalNeto)}
                  </TableCell>
                  <TableCell className={`${columnWidths.acciones} text-right`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setIndexAEliminar(index);
                        setIsAlertOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {itemsDevolucion.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    {facturaSeleccionada 
                      ? "Haga clic en 'Seleccionar Producto a Devolver' para agregar ítems."
                      : "Por favor, seleccione una factura de venta para listar sus productos."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* SECCIÓN TOTAL */}
      <div className="flex justify-end p-4 border rounded-b-md bg-slate-50/30 mb-8">
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Crédito a Devolver</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatGuaranies(totalDevolucion)}
          </p>
        </div>
      </div>
    </>
  );
}

export default function NuevaDevolucionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando módulos de devoluciones...</div>}>
      <NuevaDevolucionPageContent />
    </Suspense>
  );
}
