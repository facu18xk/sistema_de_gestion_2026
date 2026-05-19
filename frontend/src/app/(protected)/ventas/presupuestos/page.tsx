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
import { presupuestosAPI } from "@/services/presupuestosAPI"
import { estadosAPI } from "@/services/estadosAPI"
import { Estado, PresupuestoCabecera, PresupuestoCompleto } from "@/types/types"
import { notify } from "@/lib/notifications"
import { esPresupuestoVigente } from "@/utils/date-utils"
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format"

export default function PedidosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [presupuestos, setPresupuestos] = useState<PresupuestoCabecera[]>([]);
  const [presupuestoAEliminar, setPresupuestoAEliminar] = useState<PresupuestoCabecera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  //const now = new Date().toISOString().slice(0, 19);
  const now = new Date();
  console.log(now);

  //Datos locales
  /*const resPaginada = {
    "items": [
        {
            "idPresupuesto": 1,
            "idCliente": 1,
            "idEstado": 1,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 1",
        },
        {
            "idPresupuesto": 2,
            "idCliente": 3,
            "idEstado": 2,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 2",
        },
        {
            "idPresupuesto": 3,
            "idCliente": 2,
            "idEstado": 5,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-05T00:00:00',
            "descripcion": "Este es el presupuesto 3",
        },
        {
            "idPresupuesto": 4,
            "idCliente": 1,
            "idEstado": 1,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 4",
        },
        {
            "idPresupuesto": 5,
            "idCliente": 2,
            "idEstado": 1,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 5",
        },
        {
            "idPresupuesto": 6,
            "idCliente": 3,
            "idEstado": 5,
            "fechaEmision": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-01T00:00:00',
            "descripcion": "Este es el presupuesto 6",
        },
    ],
    "page": 1,
    "pageSize": 10,
    "totalCount": 10,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  }

  const resClientes = {
    "items": [
        {
          "idCliente": 1,
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
          "nombres": "Ofelia",
          "apellidos": "Porter",
          "correo": "fulano@gmail.com",
          "telefono": "0985123123",
        },
        {
          "idCliente": 2,
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
          "nombres": "Taylor",
          "apellidos": "Swift",
          "correo": "julano@gmail.com",
          "telefono": "0985234234",
        },
        {
          "idCliente": 3,
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
          "nombres": "Frankie",
          "apellidos": "Atkinson",
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

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await presupuestosAPI.getAll(currentPage, itemsPerPage);
      setPresupuestos(resPaginada.items);
      setTotalPages(resPaginada.totalPages);
    } catch (error) {
      console.error("Error al cargar presupuestos:", error)
      notify.error("Error de conexión", "No se pudo obtener la lista de presupuestos.")
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
  const handleEditar = (p: PresupuestoCabecera) => {
    router.push(`/ventas/presupuestos/${p.idPresupuesto}`);
  }

  const confirmarEliminacion = async () => {
    if (presupuestoAEliminar) {
      try {
        await presupuestosAPI.delete(presupuestoAEliminar.idPresupuesto)
        notify.success("Eliminado", "El presupuesto fue eliminado correctamente.")
        await cargarPagina()
      } catch (error) {
        console.error("Error al eliminar presupuesto:", error)
        notify.error("Error al eliminar", "El presupuesto podría tener registros asociados.")
      } finally {
        setIsAlertOpen(false)
        setPresupuestoAEliminar(null)
      }
    }
  }

  return (
    <>
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Presupuestos" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader
        title="Listado de Presupuestos"
        buttonLabel="Nuevo Presupuesto"
        onButtonClick={() => router.push('/ventas/presupuestos/nuevo')}
      />
      {/*ALERT DIALOG*/}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente el presupuesto{" "}
              <span className="font-bold text-foreground">
                "{presupuestoAEliminar ? formatearNumeroPresupuesto(presupuestoAEliminar.idPresupuesto) : ""}"
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
              Eliminar Presupuesto
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
          caption="Lista de pedidos de compra."
          headerRow={
            <TableRow>
              <TableHead>Presupuesto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {presupuestos.map((p) => {
          const vigente = esPresupuestoVigente(p.fechaVencimiento);
          const estadoActual = estados.find((e) => e.idEstado == p.idEstado)?.nombre;
          const estadoExpirado = estados.find((e) => e.idEstado === 5)?.nombre;
          const nombreCliente = presupuestos.find((c) => c.idCliente == p.idCliente)?.cliente;
          return (
            <TableRow key={p.idPresupuesto}>
              <TableCell>{formatearNumeroPresupuesto(p.idPresupuesto)}</TableCell>
              <TableCell className="font-medium">{nombreCliente}</TableCell>
              <TableCell>{new Date(p.fechaVencimiento).toLocaleDateString()}</TableCell>
              <TableCell>{
                vigente ? estadoActual === 'Aprobado' ? <Badge variant="aprobado">{estadoActual}</Badge>
                : estadoActual === 'Pendiente' ? <Badge variant="pendiente">{estadoActual}</Badge>
                : <Badge variant="desaprobado">{estadoActual}</Badge>
                : <Badge variant="destructive">{estadoExpirado}</Badge>
                
                }</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={!vigente || estadoActual === 'Pendiente' || estadoActual === 'Desaprobado'}
                  title="Generar Factura"
                >
                  <ReceiptText className="size-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Editar Factura"
                  onClick={() => handleEditar(p)}
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={estadoActual !== 'Pendiente' || !vigente}
                  title="Eliminar Factura"
                  onClick={() => {
                    setPresupuestoAEliminar(p)
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