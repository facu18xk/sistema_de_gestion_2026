"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table"
import { ClienteSelector } from "@/components/ventas/ClienteSelector";
import { ProductoSelector } from "@/components/ventas/ProductoSelector";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { notify } from "@/lib/notifications";
import { clientesAPI } from "@/services/clientesAPI";
import { productosAPI } from "@/services/productosAPI";
import { presupuestosAPI } from "@/services/presupuestosAPI";
import { preciosVentasAPI } from "@/services/preciosVentasAPI";
import { Cliente, ProductoDTO, PresupuestoCompletoSave, PreciosVentas } from "@/types/types";
import { formatGuaranies } from "@/utils/money-format";
import { formatearNumeroProducto } from "@/utils/producto-format";
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
} from "@/components/ui/alert-dialog"
import { formatCI, formatRUC } from "@/utils/cedula-format";
import { sumarDiasHabiles } from "@/utils/date-utils";

/*const resPaginada = {
  "items": [
      {
        "idCliente": 1,
        "idPersona": 1,
        "ci": "1123123",
        "ruc": "1123123-0",
        "fechaNacimiento": "2000-05-01",
        "idDireccion": 1,
        "direccion": {
            "idDireccion": 1,
            "calle1": "Calle 1 Plata",
            "calle2": "Calle 1 Bronce",
            "descripcion": "PrimeraDireccion",
            "idCiudad": 1,
            "idPais": 1
        },
        "nombres": "Facundo Axel",
        "apellidos": "Potter",
        "correo": "fulano@gmail.com",
        "telefono": "0985123123",
      },
      {
        "idCliente": 2,
        "idPersona": 1,
        "ci": "2123123",
        "ruc": "2123123-0",
        "fechaNacimiento": "2000-05-02",
        "idDireccion": 2,
        "direccion": {
            "idDireccion": 2,
            "calle1": "Calle 2 Plata",
            "calle2": "Calle 2 Bronce",
            "descripcion": "SegundaDireccion",
            "idCiudad": 1,
            "idPais": 2
        },
        "nombres": "John",
        "apellidos": "Doe",
        "correo": "julano@gmail.com",
        "telefono": "0985234234",
      },
      {
        "idCliente": 3,
        "idPersona": 1,
        "ci": "3123123",
        "ruc": "3123123-0",
        "fechaNacimiento": "2000-05-03",
        "idDireccion": 3,
        "direccion": {
            "idDireccion": 3,
            "calle1": "Calle 3 Plata",
            "calle2": "Calle 3 Bronce",
            "descripcion": "TerceraDireccion",
            "idCiudad": 1,
            "idPais": 3
        },
        "nombres": "Frank",
        "apellidos": "Maxell",
        "correo": "gulano@gmail.com",
        "telefono": "0985345345",
    },
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 10,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}*/

export default function NuevoPresupuestoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoDTO | null>(null);
  const [indexAEliminar, setIndexAEliminar] = useState(-1);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [listaProductos, setListaProductos] = useState<ProductoDTO[]>([]);
  const [listaPrecios, setListaPrecios] = useState<PreciosVentas[]>([]);
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [itemsCarrito, setItemsCarrito] = useState<ProductoDTO[]>([]);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const router = useRouter();

  const columnWidths = {
    producto: "w-[35%]",
    cantidad: "w-[100px]",
    precio: "w-[120px]",
    iva: "w-[80px]",
    subtotal: "w-[130px]",
    acciones: "w-[80px]",
  };

  const cargarClientes = async () => {
    try {
      const resClientes = await clientesAPI.getAll(1, 300);
      const ordenados = [...resClientes.items].sort((a, b) => {
        const nombreComp = a.nombres.localeCompare(b.nombres, 'es-PY');
        if (nombreComp === 0) {
          return a.apellidos.localeCompare(b.apellidos, 'es-PY');
        }
        return nombreComp;
      });
      setListaClientes(ordenados);
    } catch (error) {
      console.error("Error al cargar datos de clientes:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de clientes.")
    }
  }

  const cargarProductos = async () => {
    try {
      const resProductos = await productosAPI.getAll(1, 300);
      setListaProductos(resProductos.items);
    } catch (error) {
      console.error("Error al cargar datos de productos:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de productos.")
    }
  }

  const cargarPreciosVenta = async () => {
    try {
      const resPrecios = await preciosVentasAPI.getAll(1, 300);
      setListaPrecios(resPrecios.items);
    } catch (error) {
      console.error("Error al cargar precios de productos:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de precios.")
    }
  }

  useEffect(() => { cargarClientes(); cargarProductos(); cargarPreciosVenta(); }, []);

  const handleGuardar = async () => {
    if (!clienteSel) {
      notify.error("Datos incompletos", "Por favor, seleccione un cliente antes de continuar.");
      return;
    }
    if (itemsCarrito.length == 0) {
      notify.error("Tabla vacía", "Debe agregar al menos un producto al presupuesto.");
      return;
    }
    setIsSubmitting(true);
    try {
      const fechaHoraEmision = fechaEmision;
      const diasValidez = 10;
      //const fechaVenc = new Date(fechaEmision);
      //fechaVenc.setDate(fechaVenc.getDate() + diasValidez);
      const fechaHoraVencimiento = sumarDiasHabiles(fechaEmision, diasValidez);
      const itemsMapeados = itemsCarrito.map((item) => ({
        idProducto: item.idProducto,
        cantidad: item.cantidadTotal,
      }));
      const payload: PresupuestoCompletoSave = {
        idCliente: clienteSel.idCliente,
        idEstado: 1, //Pendiente
        fecha: fechaHoraEmision,
        descripcion: `Presupuesto para ${clienteSel.nombres} ${clienteSel.apellidos}`,
        fechaVencimiento: fechaHoraVencimiento,
        items: itemsMapeados,
      };
      await presupuestosAPI.create(payload);
      //console.log("Payload:",payload)
      notify.success("!Éxito!", "Presupuesto guardado correctamente.");
      router.push("/ventas/presupuestos");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el presupuesto: ", error);
      notify.error("Error al guardar", "Ocurrió un problema en el servidor al intentar registrar el presupuesto.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const agregarAlCarrito = (producto: ProductoDTO) => {
    // Verificamos si ya existe para aumentar cantidad o añadir nuevo
    setItemsCarrito(prev => {
      const existe = prev.find(item => item.idProducto === producto.idProducto);
      if (existe) {
        return prev.map(item => 
          item.idProducto === producto.idProducto 
            ? { ...item, cantidadTotal: item.cantidadTotal + 1 } 
            : item
        );
      }
      return [...prev, { ...producto, cantidadTotal: 1 }];
    });
    setIsProductoModalOpen(false);
  };

  const updateCantidad = (index: number, nuevaCantidad: number) => {
    //console.log(`Modificar ${index} con cantidad ${nuevaCantidad}`)
    //if (nuevaCantidad < 1) return;
    setItemsCarrito(prev => {
      const nuevoCarrito = [...prev];
      nuevoCarrito[index] = { ...nuevoCarrito[index], cantidadTotal: nuevaCantidad };
      return nuevoCarrito;
    });
  };

  const removeItem = (index: number) => {
    setItemsCarrito(prev => prev.filter((_, i) => i !== index));
  };

  const hanldeEliminar = async () => {
    if (productoAEliminar) {
      try {
        removeItem(indexAEliminar);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        notify.error("Error", "No se pudo eliminar");
      } finally {
        setIsAlertOpen(false);
        setProductoAEliminar(null);
        setIndexAEliminar(-1);
      }
    }
  };

  const handleCantidad = async (index: number ,input: string) => {
      if (input === "") {
        updateCantidad(index, 0);
        return;
      }
      const soloNumerosRegex = /^[0-9]+$/;
      if (soloNumerosRegex.test(input)) {
        updateCantidad(index, Number(input));
      }
  }

  const totalGeneral = itemsCarrito.reduce(
    (acc, item) => acc + ((item.cantidadTotal * item.precioUnitario) * ((item.porcentajeIva/100) + 1)), 0
  );

  return (
    <>
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Presupuestos", href: "/ventas/presupuestos" }, {label: "Nuevo Presupuesto"}]} />
      <h1 className="text-xl font-bold tracking-tight">Nuevo Presupuesto</h1>
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Eliminarás el producto{" "}
            <span className="font-bold text-foreground">
              "{productoAEliminar?.descripcion}"
            </span>{" "}
            de la lista del presupuesto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => hanldeEliminar()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar Producto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
      {/* SELECTOR CLIENTE */}
      <div className="flex justify-between">
        <div>
        <ClienteSelector 
          clientesIniciales={listaClientes} 
          onSelect={setClienteSel}
          selectedClienteId={clienteSel?.idCliente}
        />
        </div>
        <div>
        <Button variant="outline" className="h-8 gap-2 cursor-pointer mr-2" onClick={() => router.push("/ventas/presupuestos")}>
          Cancelar
        </Button>
        <Button 
          className="h-8 gap-2 cursor-pointer" 
          onClick={handleGuardar}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Presupuesto"}
        </Button>
        </div>
      </div>
      {/* CABECERA DE DATOS */}
      <div className="p-3 border rounded-lg bg-slate-50/40 text-xs shadow-sm my-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* DATOS CLIENTE */}
          <div className="md:col-span-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Información del Cliente
            </p>
            {clienteSel ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-r pr-2 border-slate-200">
                <div>
                  <p className="text-muted-foreground text-[13px]">Razón Social</p>
                  <p className="font-semibold text-slate-900 text-[13px]">{clienteSel.nombres} {clienteSel.apellidos}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[13px]">CI / RUC</p>
                  <p className="font-medium text-slate-800 text-[13px]">
                    {clienteSel.ruc ? `RUC: ${formatRUC(clienteSel.ruc)}` : `CI: ${formatCI(clienteSel.ci)}`}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-muted-foreground text-[13px]">Email</p>
                  <p className="font-medium text-slate-700 text-[13px]">{clienteSel.correo || "No registrado"}</p>
                </div>
                {/*<div className="hidden sm:block">
                  <p className="text-muted-foreground text-[13px]">Fecha de Nacimiento</p>
                  <p className="font-medium text-slate-700 text-[13px]">{new Date(clienteSel.fechaNacimiento).toLocaleDateString()}</p>
                </div>*/}
                <div className="hidden sm:block">
                  <p className="text-muted-foreground text-[13px]">Teléfono</p>
                  <p className="font-medium text-slate-700 text-[13px]">{formatPhone(clienteSel.telefono) || "No registrado"}</p>
                </div>
              </div>
            ) : (
              <div className="h-8 flex items-center pl-3 border border-dashed rounded bg-white text-muted-foreground italic text-[11px]">
                Ningún cliente seleccionado actualmente
              </div>
            )}
          </div>
          {/* DATOS PRESUPUESTO */}
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Fecha Emisión</label>
            <Input 
              type="date" 
              value={fechaEmision} 
              onChange={(e) => setFechaEmision(e.target.value)}
              className="h-8 bg-white mt-1 text-xs px-2 text-[13px]"
            />
          </div>
          {/*<div className="flex flex-col justify-end pb-0.5 md:items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block md:hidden">Estado</span>
            <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 px-2.5 py-1 text-[13px] font-medium text-yellow-800 border border-yellow-200/60 shadow-sm w-full sm:w-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 animate-pulse" />
              Borrador / Pendiente
            </span>
          </div>*/}
        </div>
      </div>
      {/* SELECTOR DE PRODUCTOS */}
      <ProductoSelector 
        isOpen={isProductoModalOpen}
        onClose={() => setIsProductoModalOpen(false)}
        onSelect={(producto) => agregarAlCarrito(producto)}
        productos={listaProductos}
        precios={listaPrecios}
      />
      <div className="mt-3 flex justify-end">
        <Button variant="default" className="h-8 gap-2 cursor-pointer" onClick={() => setIsProductoModalOpen(true)} disabled={!clienteSel}>
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
                <TableHead className={columnWidths.precio}>Precio</TableHead>
                <TableHead className={columnWidths.iva}>IVA</TableHead>
                <TableHead className={`${columnWidths.subtotal} text-right`}>Subtotal</TableHead>
                <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* CUERPO TABLA (CON SCROLL) */}
        <div className="max-h-[215px] overflow-y-auto"> {/*estaba en 320px*/}
          <Table className="table-fixed">
            <TableBody>
              {itemsCarrito.map((item, index) => {
                const subtotal = (item.cantidadTotal * item.precioUnitario) * ((item.porcentajeIva/100) + 1);
                return (
                  <TableRow key={item.idProducto} className="border-b last:border-0 hover:bg-slate-50/50">
                    {/* DESCRIPCIÓN E ID */}
                    <TableCell className={columnWidths.producto}>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium truncate" title={item.descripcion}>
                          {item.descripcion}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatearNumeroProducto(item.idProducto)}
                        </span>
                      </div>
                    </TableCell>
                    {/* CANTIDAD */}
                    {/*<TableCell className={columnWidths.cantidad}>
                      <Input 
                        type="number" 
                        min="1"
                        className="w-16 h-8 px-2"
                        value={item.cantidadTotal} 
                        onChange={(e) => updateCantidad(index, Number(e.target.value))} 
                      />
                    </TableCell>*/}
                    <TableCell className={columnWidths.cantidad}>
                      <Input 
                        type="text" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-16 h-8 px-2 text-center"
                        value={item.cantidadTotal === 0 ? "" : item.cantidadTotal}
                        onChange={(e) => {handleCantidad(index, e.target.value)}}
                        onBlur={() => {
                          if (item.cantidadTotal === 0) {
                            updateCantidad(index, 1);
                          }
                        }} 
                      />
                    </TableCell>
                    {/* PRECIO UNITARIO */}
                    <TableCell className={columnWidths.precio}>
                      <span className="text-sm">{formatGuaranies(item.precioUnitario)}</span>
                    </TableCell>
                    {/* %IVA */}
                    <TableCell className={columnWidths.iva}>
                      <span className="text-sm">{item.porcentajeIva}%</span>
                    </TableCell>
                    {/* SUBTOTAL */}
                    <TableCell className={`${columnWidths.subtotal} text-right font-bold`}>
                      {formatGuaranies(subtotal)}
                    </TableCell>
                    {/* ACCIONES */}
                    <TableCell className={`${columnWidths.acciones} text-right`}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {setProductoAEliminar(item); setIndexAEliminar(index); setIsAlertOpen(true);}}
                      >
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* CARRITO VACÍO */}
              {!clienteSel && itemsCarrito.length === 0 && (
                <TableRow>
                <TableCell className="py-12 text-center text-muted-foreground text-sm" onClick={() => {if(clienteSel){setIsProductoModalOpen(true)}}}>
                  Seleccione un cliente para empezar.
                </TableCell>
                </TableRow>
              )}
              {clienteSel && itemsCarrito.length === 0 && (
                <TableRow>
                <TableCell className="py-12 text-center text-muted-foreground text-sm" onClick={() => {if(clienteSel){setIsProductoModalOpen(true)}}}>
                  No hay productos seleccionados. Use el botón "+ Agregar" para comenzar.
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
