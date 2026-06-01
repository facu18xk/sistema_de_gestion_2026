"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { ProductoSelector } from "@/components/ventas/ProductoSelector";
import { PresupuestoSelector } from "@/components/ventas/PresupuestoSelector";
import { notify } from "@/lib/notifications";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
import { Cliente, PresupuestoCompleto, ProductoDTO, PreciosVentas, FacturaVentaItem, PresupuestoItem, MedioPago, PresupuestoCabecera, FacturaVentaCompletoSave } from "@/types/types";
import { presupuestosAPI } from "@/services/presupuestosAPI";
import { clientesAPI } from "@/services/clientesAPI";
import { productosAPI } from "@/services/productosAPI";
import { preciosVentasAPI } from "@/services/preciosVentasAPI";
import { mediosPagosAPI } from "@/services/mediosPagosAPI"; 
import { facturasAPI } from "@/services/facturasAPI";
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format";
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
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { formatearFecha } from "@/utils/date-utils";

function NuevaFacturaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPresupuestoQuery = searchParams.get("presupuestoId"); //ID desde la URL (?presupuestoId=X)
  const idPresupuesto = idPresupuestoQuery ? Number(idPresupuestoQuery) : null;
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [listaProductos, setListaProductos] = useState<ProductoDTO[]>([]);
  const [listaPrecios, setListaPrecios] = useState<PreciosVentas[]>([]);
  const [listaMediosPagos, setListaMediosPagos] = useState<MedioPago[]>([]);
  const [listaPresupuestos, setListaPresupuestos] = useState<PresupuestoCabecera[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [presupuestoSel, setPresupuestoSel] = useState<PresupuestoCabecera>();
  const [itemsCarrito, setItemsCarrito] = useState<PresupuestoItem[]>([]);
  const [descripcionFactura, setDescripcionFactura] = useState("");
  const [idMedioPago, setIdMedioPago] = useState<number>(1); // Ej: 1=Efectivo, 2=Tarjeta
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [indexAEliminar, setIndexAEliminar] = useState<number>(-1);
  const [itemAEliminarDescripcion, setItemAEliminarDescripcion] = useState("");

  const columnWidths = {
    producto: "w-[35%]",
    cantidad: "w-[100px]",
    precio: "w-[120px]",
    iva: "w-[80px]",
    subtotal: "w-[130px]",
    acciones: "w-[80px]",
  };

  useEffect(() => {
    const inicializarPantalla = async () => {
      try {
        setLoading(true);

        const resProductos = await productosAPI.getAll(1, 300);
        setListaProductos(resProductos.items);

        const resPrecios = await preciosVentasAPI.getAll();
        setListaPrecios(resPrecios.items);

        const resMediosPagos = await mediosPagosAPI.getAll();
        setListaMediosPagos(resMediosPagos.items);

        if (idPresupuesto) {
          const srcPresupuesto = await presupuestosAPI.getById(idPresupuesto);

          if (!srcPresupuesto) {
            notify.error("Error", "El presupuesto solicitado no existe.");
            router.push("/ventas/facturacion/nuevo");
            return;
          }

          if (srcPresupuesto.idEstado !== 2) {
            notify.error("Acción denegada", "El presupuesto debe estar Aprobado.");
            router.push("/ventas/facturacion/nuevo");
            return;
          }

          setDescripcionFactura(`Generado desde ${formatearNumeroPresupuesto(idPresupuesto)}`);
          setItemsCarrito(srcPresupuesto.items);
          setPresupuestoSel(srcPresupuesto);

          if (srcPresupuesto.idCliente) {
            const resCliente = await clientesAPI.getById(srcPresupuesto.idCliente);
            setCliente(resCliente);
          }

        } else {
          setItemsCarrito([]);
          setCliente(null);
          setDescripcionFactura("Nueva factura de venta directa");
          const resPresupuestos = await presupuestosAPI.getAll(1, 200);
          setListaPresupuestos(resPresupuestos.items);
        }

      } catch (error) {
        console.error("Error al inicializar la factura:", error);
        notify.error("Error de conexión", "No se pudieron cargar los componentes de la pantalla.");
      } finally {
        setLoading(false);
      }
    };
    inicializarPantalla();
  }, [idPresupuesto]);

  const agregarAlCarrito = (producto: ProductoDTO) => {
    const stockDisponible = producto.cantidadTotal ?? 0;
    if (stockDisponible <= 0) {
      notify.error("Sin Stock", `El producto "${producto.descripcion}" no tiene existencias disponibles.`);
      return;
    }
    setItemsCarrito(prev => {
      const existe = prev.find(item => item.idProducto === producto.idProducto);
      if (existe) {
        if (existe.cantidad + 1 > stockDisponible) {
          notify.error("Límite de Stock", `No puedes agregar más unidades. El stock máximo es de ${stockDisponible}.`);
          return prev;
        }
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
    const itemAEditar = itemsCarrito[index];
    if (!itemAEditar) return;
    const productoOriginal = listaProductos.find(p => p.idProducto === itemAEditar.idProducto);
    const stockDisponible = productoOriginal ? (productoOriginal.cantidadTotal ?? 0) : 0;
    if (nuevaCantidad > stockDisponible) {
      notify.error(
        "Stock Excedido", 
        `Solo hay ${stockDisponible} unidades disponibles de "${itemAEditar.producto}".`
      );
      return;
    }
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
  };

  const handleGuardarFactura = async () => {
    const presupuestoIdFinal = idPresupuesto || presupuestoSel?.idPresupuesto || 0;
    if (presupuestoIdFinal === 0) {
      notify.error("Presupuesto Requerido", "Debe seleccionar un presupuesto aprobado para emitir la factura.");
      return;
    }

    if (!cliente || itemsCarrito.length === 0) {
      notify.error("Incompleto", "Asegúrese de contar con un cliente e ítems cargados.");
      return;
    }

    setIsSubmitting(true);
    const fechaHoy = new Date().toISOString().split('T')[0];

    const payload: FacturaVentaCompletoSave = {
      idPresupuesto: presupuestoIdFinal,
      idCliente: cliente.idCliente,
      fecha: fechaHoy,
      descripcion: descripcionFactura.trim() || `Facturación del Presupuesto ${formatearNumeroPresupuesto(presupuestoIdFinal)}`,
      idMedioPagoCompra: idMedioPago,
      fechaPago: fechaHoy,
      items: itemsCarrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };

    try {
      await facturasAPI.create(payload);
      notify.success("¡Factura Emitida!", "La factura ha sido registrada y procesada con éxito.");
      router.push("/ventas/facturacion");
    } catch (error) {
      console.error("Error al registrar la factura:", error);
      notify.error("Error", "Hubo un fallo en el servidor al intentar emitir la factura.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos de facturación...</div>;

  const totalGeneral = itemsCarrito.reduce(
    (acc, item) => acc + ((item.cantidad * item.precioUnitario) * ((item.iva / 100) + 1)), 0
  );

  const handleSeleccionarPresupuesto = async (id: number) => {
    try {
      setIsImporting(true);
      const srcPresupuesto = await presupuestosAPI.getById(id);
      if (srcPresupuesto) {
        setPresupuestoSel(srcPresupuesto);
        setDescripcionFactura(`Generado desde ${formatearNumeroPresupuesto(id)}`);
        setItemsCarrito(srcPresupuesto.items);
  
        if (srcPresupuesto.idCliente) {
          const resCliente = await clientesAPI.getById(srcPresupuesto.idCliente);
          setCliente(resCliente);
        }
        notify.success("Presupuesto importado", `Datos cargados desde el Presupuesto ${formatearNumeroPresupuesto(id)}`);
      }
    } catch (error) {
      console.error("Error al importar presupuesto:", error);
      notify.error("Error", "No se pudieron obtener los datos del presupuesto.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <PageBreadcrumb steps={[
        { label: "Ventas", href: "#" }, 
        { label: "Facturación", href: "/ventas/facturacion" }, 
        { label: "Nueva Factura" }
      ]} />
      <h1 className="text-xl font-bold tracking-tight">Factura de Venta</h1>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Retirar producto de la factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Quitarás "{itemAEliminarDescripcion}" del desglose final.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={ejecutarEliminacion} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* CABECERA DE ACCIONES */}
      <div className="flex justify-between items-center my-2">
        <div>
        {presupuestoSel && (
            <p className="text-xs text-muted-foreground">Generada a partir del Presupuesto {formatearNumeroPresupuesto(presupuestoSel.idPresupuesto)}</p>
        )}
        {!idPresupuesto && (
          <div className="w-[350px] flex items-center gap-2 mt-2">
            <PresupuestoSelector 
              presupuestos={listaPresupuestos} 
              onSelectPresupuesto={handleSeleccionarPresupuesto}
              selectedPresupuestoId={presupuestoSel?.idPresupuesto}
            />
            {isImporting && <RefreshCw className="h-4 w-4 text-amber-600 animate-spin" />}
          </div>
        )} 
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2"/> Volver
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleGuardarFactura} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2"/> {isSubmitting ? "Procesando..." : "Registrar Factura"}
          </Button>
        </div>
      </div>
      {/* CABECERA DE DATOS */}
        <div className="p-3 border rounded-lg bg-slate-50/40 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* DATOS CLIENTE */}
            <div className="md:col-span-2 border-b md:border-b-0 md:border-r pb-3 md:pb-0 pr-0 md:pr-4 border-slate-200">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Datos del Cliente
                </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div>
                    <p className="text-muted-foreground text-[13px]">Razón Social</p>
                    <p className="font-semibold text-slate-900 truncate text-[13px]">
                        {cliente ? `${cliente.nombres} ${cliente.apellidos}` : "Sin especificar"}
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
                <div>
                    <p className="text-muted-foreground text-[13px]">Fecha Nacimiento</p>
                    <p className="font-medium text-slate-700 text-[13px]">
                        {cliente ? formatearFecha(cliente.fechaNacimiento) : "---"}
                </p>
                </div>
            </div>
            </div>
            {/* MEDIO PAGO Y DESCRIPCIÓN*/}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Medio Pago</label>
              <Select
                  value={idMedioPago ? String(idMedioPago) : undefined}
                  onValueChange={(val) => setIdMedioPago(Number(val))}
              >
                  <SelectTrigger className="w-full h-8 bg-white shadow-sm text-sm mt-0.5 px-2">
                  <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                  {listaMediosPagos.map((medio) => (
                      <SelectItem 
                      key={medio.idMedioPagoCompra} 
                      value={String(medio.idMedioPagoCompra)} 
                      className="text-sm"
                      >
                      {medio.nombre} 
                      </SelectItem>
                  ))}
                  </SelectContent>
              </Select>
              <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Descripción Interna</label>
                  <Input 
                      placeholder="Observaciones de la factura..."
                      value={descripcionFactura} 
                      onChange={(e) => setDescripcionFactura(e.target.value)} 
                      className="h-8 bg-white mt-0.5 text-sm px-2"
                  />
              </div>
            </div>
            {/* ESTADO DE LA FACTURA */}
          {/*<div className="flex flex-col justify-start h-full md:items-end md:pl-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Estado de Factura</span>
            <div className="w-full md:w-auto">
              <span className="inline-flex items-center justify-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 shadow-sm w-full md:w-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                Borrador
              </span>
            </div>
          </div>*/}
          <div className="self-start">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">N° Comprobante</p>
              <p className="font-medium text-slate-800 text-[13px]">123</p>
          </div>
        </div>
        </div>
      {/* SELECTOR DE PRODUCTOS */}
      <ProductoSelector 
        isOpen={isProductoModalOpen}
        onClose={() => setIsProductoModalOpen(false)}
        onSelect={agregarAlCarrito}
        productos={listaProductos}
        precios={listaPrecios}
      />
      <div className="mt-3 flex justify-end">
        <Button variant="default" className="h-8 gap-2 cursor-pointer" onClick={() => setIsProductoModalOpen(true)} disabled={!cliente}>
          <Plus/> Agregar
        </Button>
      </div>
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
                <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
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
                const prodMaster = listaProductos.find(p => p.idProducto === item.idProducto);
                const maxStock = prodMaster ? (prodMaster.cantidadTotal ?? 0) : 9999;
                return (
                  <TableRow key={item.idProducto} className="border-b last:border-0 hover:bg-slate-50/50">
                    {/* PRODUCTO */}
                    <TableCell className={columnWidths.producto}>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{item.producto}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatearNumeroProducto(item.idProducto)}
                        </span>
                      </div>
                    </TableCell>
                    {/* CANTIDAD */}
                    <TableCell className={columnWidths.cantidad}>
                      <Input 
                        type="number" 
                        min="1"
                        max={maxStock}
                        className="w-16 h-8 px-2"
                        value={item.cantidad} 
                        onChange={(e) => updateCantidad(index, Number(e.target.value))} 
                      />
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
                  </TableRow>
                );
              })}
              {/* CARRITO VACÍO */}
              {itemsCarrito.length === 0 && (
                <TableRow>
                <TableCell className="py-12 text-center text-muted-foreground text-sm" onClick={() => {if(cliente) {setIsProductoModalOpen(true)}}}>
                  No hay productos seleccionados. Use el botón "+ Agregar" para comenzar.
                </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* INFORMACIÓN ÚTIL */}
      <div className="flex justify-end p-4 border rounded-b-md bg-slate-50/30 mb-8">
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total a Facturar</p>
          <p className="text-2xl font-black text-primary mt-1">
            {formatGuaranies(totalGeneral)}
          </p>
        </div>
      </div>
    </>
  );
}

export default function NuevaFacturaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando módulo de facturación...</div>}>
      <NuevaFacturaContent />
    </Suspense>
  );
}
