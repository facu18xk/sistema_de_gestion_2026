"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, ReceiptText, FileText, TimerOff, Eye, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useRouter } from "next/navigation"
import { facturasAPI } from "@/services/facturasAPI"
import { estadosAPI } from "@/services/estadosAPI"
import { Estado, FacturaVentaCabecera, PresupuestoCabecera, FacturaVentaCompleto } from "@/types/types"
import { notify } from "@/lib/notifications"
import { esPresupuestoVigente, formatearFecha } from "@/utils/date-utils"
import { formatearNumeroFactura } from "@/utils/factura-format"
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format"
import { formatGuaranies } from "@/utils/money-format"

const columnWidths = {
  factura: "w-[140px]",
  presupuesto: "w-[80px]",
  cliente: "w-[130px]",
  fecha: "w-[100px]",
  estado: "w-[100px]",
  total: "w-[100px]",
  acciones: "w-[80px]",
};

export default function FacturasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  //const [facturas, setFacturas] = useState<FacturaVentaCabecera[]>([]);
  const [todasLasFacturas, setTodasLasFacturas] = useState<FacturaVentaCompleto[]>([]);
  const [facturaAEliminar, setFacturaAEliminar] = useState<FacturaVentaCompleto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("")

  //const now = new Date().toISOString().slice(0, 19);
  const now = new Date();
  console.log(now);

  //Datos locales
  /*const resPaginada = {
    "items": [
        {
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
            "fechaPago": "2026-05-22"
        },
        {
            "idFacturaVenta": 2,
            "idPresupuesto": 2,
            "presupuestoDescripcion": "Factura de Venta 2",
            "idCliente": 2,
            "cliente": "Cliente 2",
            "nroComprobante": "-- Sin especificar --",
            "idTimbrado": 2,
            "timbrado": "",
            "timbradoRuc": "",
            "fecha": "2026-05-22",
            "descripcion": "Descripcion 2",
            "idMedioPagoCompra": 1,
            "medioPagoCompra": "Efectivo",
            "fechaPago": "2026-05-22"
        },
        {
            "idFacturaVenta": 3,
            "idPresupuesto": 3,
            "presupuestoDescripcion": "Factura de Venta 3",
            "idCliente": 3,
            "cliente": "Cliente 3",
            "nroComprobante": "-- Sin especificar --",
            "idTimbrado": 3,
            "timbrado": "",
            "timbradoRuc": "",
            "fecha": "2026-05-22",
            "descripcion": "Descripcion 3",
            "idMedioPagoCompra": 2,
            "medioPagoCompra": "Transferencia",
            "fechaPago": "2026-05-22"
        },
    ],
    "page": 1,
    "pageSize": 10,
    "totalCount": 10,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }*/

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await facturasAPI.getAllCompleto(currentPage, 200);
      //setFacturas(resPaginada.items);
      const ordenados = [...resPaginada.items].sort((a, b) => {
        // --- CRITERIO 1: ESTADO (Mandar 'Anulado' al final) ---
        if (a.estado === 'Anulado' && b.estado !== 'Anulado') return 1;
        if (a.estado !== 'Anulado' && b.estado === 'Anulado') return -1;

        // --- CRITERIO 2: NRO COMPROBANTE (Descendente) ---
        return b.nroComprobante.localeCompare(a.nroComprobante, 'es-PY');
      });
      setTodasLasFacturas(ordenados);
      //setTotalPages(resPaginada.totalPages);
    } catch (error) {
      console.error("Error al cargar facturas:", error)
      notify.error("Error de conexión", "No se pudo obtener la lista de facturas.")
    } finally {
      setIsLoading(false)
    }
  }

  const cargarEstados = async () => {
    try{
        const resEstado = await estadosAPI.getAll();
        setEstados(resEstado.items);
        //console.log(resEstado.items);
    } catch (error) {
        console.error("Error al cargar estados:", error)
        notify.error("Error de conexión", "No se pudo obtener la lista de estados.")
    }
  }

  //useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarPagina(), cargarEstados() }, []);

  //FILTRO DE BÚSQUEDA
  const facturasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return todasLasFacturas;
    
    const query = searchTerm.toLowerCase().trim();
    return todasLasFacturas.filter(f => 
      f.nroComprobante.toLowerCase().toString().includes(query) ||
      formatearNumeroPresupuesto(f.idPresupuesto).toLowerCase().toString().includes(query) ||
      f.cliente.toLowerCase().includes(query) ||
      f.estado.toLowerCase().includes(query) ||
      formatearFecha(f.fecha).toLowerCase().includes(query)
    );
  }, [searchTerm, todasLasFacturas]);

  const totalPages = Math.ceil(facturasFiltradas.length / itemsPerPage) || 1;

  const facturasVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return facturasFiltradas.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, facturasFiltradas]);
  console.log("Facturas:", facturasVisiblesEnPagina)

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <>
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Facturación" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader
        title="Listado de Facturas"
        buttonLabel="Nueva Factura"
        onButtonClick={() => router.push('/ventas/facturacion/nuevo')}
      />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por factura, presupuesto, cliente, fecha o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm w-full bg-white shadow-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DataTable
          caption="Lista de facturas de venta."
          headerRow={
            <TableRow>
              <TableHead className={`${columnWidths.factura}`}>Factura</TableHead>
              <TableHead className={`${columnWidths.presupuesto}`}>Presupuesto</TableHead>
              <TableHead className={`${columnWidths.cliente}`}>Cliente</TableHead>
              <TableHead className={`${columnWidths.fecha}`}>Fecha Emisión</TableHead>
              <TableHead className={`${columnWidths.estado}`}>Estado</TableHead>
              <TableHead className={`${columnWidths.total} text-right`}>Total</TableHead>
              <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {facturasVisiblesEnPagina.map((f) => {
          //const vigente = esPresupuestoVigente(p.fechaVencimiento);
          //const estadoActual = estados.find((e) => e.idEstado == p.idEstado)?.nombre;
          const estadoActual = f.estado;
          //const estadoExpirado = "Expirado"
          //const nombreCliente = todasLasFacturas.find((c) => c.idCliente == f.idCliente)?.cliente;
          const totalFacturado = f.items.reduce((acc, item) => {
            return acc + (item.totalNeto);
          }, 0);
          return (
            <TableRow key={f.idFacturaVenta}>
              <TableCell className={`${columnWidths.factura}`}>{f.nroComprobante}</TableCell>
              <TableCell className={`${columnWidths.presupuesto}`}>{formatearNumeroPresupuesto(f.idPresupuesto)}</TableCell>
              <TableCell className={`${columnWidths.cliente} font-medium`}>{f.cliente}</TableCell>
              <TableCell className={`${columnWidths.fecha}`}>{formatearFecha(f.fecha)}</TableCell>
              <TableCell className={`${columnWidths.estado}`}>{
                estadoActual === 'Emitido' ? <Badge variant="aprobado">{estadoActual}</Badge> : 
                <Badge variant="destructive">{estadoActual}</Badge>}
              </TableCell>
              <TableCell className={`${columnWidths.acciones} text-right`}>{formatGuaranies(totalFacturado)}</TableCell>
              <TableCell className={`${columnWidths.acciones} text-right`}>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ver Factura"
                  onClick={() => router.push(`/ventas/facturacion/${f.idFacturaVenta}`)}
                >
                  <Eye className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
        {facturasVisiblesEnPagina.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
              No hay facturas que coincidan con la búsqueda.
            </TableCell>
          </TableRow>
        )}
        </DataTable>
      )}
    </>
  )
}
