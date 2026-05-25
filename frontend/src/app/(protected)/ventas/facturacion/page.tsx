"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Loader2, ReceiptText, FileText, TimerOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Estado, FacturaVentaCabecera, PresupuestoCabecera, PresupuestoCompleto } from "@/types/types"
import { notify } from "@/lib/notifications"
import { esPresupuestoVigente } from "@/utils/date-utils"
import { formatearNumeroFactura } from "@/utils/factura-format"

export default function PedidosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [facturas, setFacturas] = useState<FacturaVentaCabecera[]>([]);
  const [facturaAEliminar, setFacturaAEliminar] = useState<FacturaVentaCabecera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  //const now = new Date().toISOString().slice(0, 19);
  const now = new Date();
  console.log(now);

  //Datos locales
  const resPaginada = {
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
  }

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      //const resPaginada = await facturasAPI.getAll(currentPage, itemsPerPage);
      setFacturas(resPaginada.items);
      setTotalPages(resPaginada.totalPages);
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

  useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarEstados() }, []);

  // 2. ACCIONES
  const handleEditar = (p: FacturaVentaCabecera) => {
    router.push(`/ventas/facturacion/${p.idFacturaVenta}`);
  }

  const confirmarEliminacion = async () => {
    if (facturaAEliminar) {
      try {
        //await facturasAPI.delete(facturaAEliminar.idFacturaVenta)
        notify.success("Eliminado", "La factura fue eliminada correctamente.")
        await cargarPagina()
      } catch (error) {
        console.error("Error al eliminar factura:", error)
        notify.error("Error al eliminar", "La factura podría tener registros asociados.")
      } finally {
        setIsAlertOpen(false)
        setFacturaAEliminar(null)
      }
    }
  }

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
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente la factura{" "}
              <span className="font-bold text-foreground">
                "{facturaAEliminar ? formatearNumeroFactura(facturaAEliminar.idFacturaVenta) : ""}"
              </span>{" "}
              y se quitará del servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Factura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
              <TableHead>Factura</TableHead>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Emisión/Pago</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {facturas.map((f) => {
          //const vigente = esPresupuestoVigente(p.fechaVencimiento);
          //const estadoActual = estados.find((e) => e.idEstado == p.idEstado)?.nombre;
          const estadoActual: string = "Pendiente"
          const estadoExpirado = "Vencido"
          const nombreCliente = facturas.find((c) => c.idCliente == f.idCliente)?.cliente;
          return (
            <TableRow key={f.idFacturaVenta}>
              <TableCell>{formatearNumeroFactura(f.idFacturaVenta)}</TableCell>
              <TableCell>{formatearNumeroFactura(f.idFacturaVenta)}</TableCell>
              <TableCell className="font-medium">{nombreCliente}</TableCell>
              <TableCell>{new Date(f.fecha).toLocaleDateString()}</TableCell>
              <TableCell>{
                estadoActual === 'Aprobado' ? <Badge variant="aprobado">{estadoActual}</Badge>
                : estadoActual === 'Pendiente' ? <Badge variant="pendiente">{estadoActual}</Badge>
                : estadoActual === 'Rechazado' ? <Badge variant="rechazado">{estadoActual}</Badge>
                : <Badge variant="destructive">Expirado</Badge>
                
                }</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar Factura"
                  onClick={() => router.push(`/ventas/facturacion/${f.idFacturaVenta}`)}
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={estadoActual !== 'Pendiente'}
                  title="Eliminar Factura"
                  onClick={() => {
                    setFacturaAEliminar(f)
                    setIsAlertOpen(true)
                  }}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
        </DataTable>
      )}
    </>
  )
}
