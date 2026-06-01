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
import { presupuestosAPI } from "@/services/presupuestosAPI"
import { estadosAPI } from "@/services/estadosAPI"
import { Estado, PresupuestoCabecera, PresupuestoCompleto } from "@/types/types"
import { notify } from "@/lib/notifications"
import { esPresupuestoVigente } from "@/utils/date-utils"
import { formatearNumeroPresupuesto } from "@/utils/presupuesto-format"

const columnWidths = {
  presupuesto: "w-[100px]",
  cliente: "w-[150px]",
  vencimiento: "w-[120px]",
  estado: "w-[100px]",
  acciones: "w-[120px]",
};

export default function PedidosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  //const [presupuestos, setPresupuestos] = useState<PresupuestoCabecera[]>([]);
  const [todosLosPresupuestos, setTodosLosPresupuestos] = useState<PresupuestoCabecera[]>([])
  const [presupuestoAEliminar, setPresupuestoAEliminar] = useState<PresupuestoCabecera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("")

  //const now = new Date().toISOString().slice(0, 19);
  const now = new Date();
  console.log(now);

  //Datos locales
  /*const resPaginada = {
    "items": [
        {
            "idPresupuesto": 1,
            "idCliente": 1,
            "cliente": "Cliente 1",
            "idEstado": 1,
            "estado": "Pendiente",
            "fecha": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 1",
        },
        {
            "idPresupuesto": 2,
            "idCliente": 3,
            "cliente": "Cliente 3",
            "idEstado": 2,
            "estado": "Aprobado",
            "fecha": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 2",
        },
        {
            "idPresupuesto": 3,
            "idCliente": 2,
            "cliente": "Cliente 2",
            "idEstado": 5,
            "estado": "Expirado",
            "fecha": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-05T00:00:00',
            "descripcion": "Este es el presupuesto 3",
        },
        {
            "idPresupuesto": 4,
            "idCliente": 1,
            "cliente": "Cliente 1",
            "idEstado": 1,
            "estado": "Pendiente",
            "fecha": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 4",
        },
        {
            "idPresupuesto": 5,
            "idCliente": 2,
            "cliente": "Cliente 2",
            "idEstado": 1,
            "estado": "Pendiente",
            "fecha": '2026-05-01T00:00:00',
            "fechaVencimiento": '2026-05-11T00:00:00',
            "descripcion": "Este es el presupuesto 5",
        },
        {
            "idPresupuesto": 6,
            "idCliente": 3,
            "cliente": "Cliente 3",
            "idEstado": 5,
            "estado": "Expirado",
            "fecha": '2026-05-01T00:00:00',
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
      const resPaginada = await presupuestosAPI.getAll(currentPage, 100);
      setTodosLosPresupuestos(resPaginada.items);
      //setTotalPages(resPaginada.totalPages);
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

  //useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarPagina(), cargarEstados() }, []);

  //FILTRO DE BÚSQUEDA
  const presupuestosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return todosLosPresupuestos;
    
    const query = searchTerm.toLowerCase().trim();
    return todosLosPresupuestos.filter(p => 
      formatearNumeroPresupuesto(p.idPresupuesto).toLowerCase().toString().includes(query) ||
      p.cliente.toLowerCase().includes(query)
    );
  }, [searchTerm, todosLosPresupuestos]);

  const totalPages = Math.ceil(presupuestosFiltrados.length / itemsPerPage) || 1;

  const presupuestosVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return presupuestosFiltrados.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, presupuestosFiltrados]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

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
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por presupuesto o cliente..."
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
          caption="Lista de presupuestos."
          headerRow={
            <TableRow>
              <TableHead className={`${columnWidths.presupuesto}`}>Presupuesto</TableHead>
              <TableHead className={`${columnWidths.cliente}`}>Cliente</TableHead>
              <TableHead className={`${columnWidths.vencimiento}`}>Vencimiento</TableHead>
              <TableHead className={`${columnWidths.estado}`}>Estado</TableHead>
              <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {presupuestosVisiblesEnPagina.map((p) => {
          //const vigente = esPresupuestoVigente(p.fechaVencimiento);
          const estadoActual = estados.find((e) => e.idEstado == p.idEstado)?.nombre;
          const estadoExpirado = estados.find((e) => e.idEstado === 5)?.nombre;
          const nombreCliente = todosLosPresupuestos.find((c) => c.idCliente == p.idCliente)?.cliente;
          return (
            <TableRow key={p.idPresupuesto}>
              <TableCell className={`${columnWidths.presupuesto}`}>{formatearNumeroPresupuesto(p.idPresupuesto)}</TableCell>
              <TableCell className={`${columnWidths.cliente} font-medium`}>{nombreCliente}</TableCell>
              <TableCell className={`${columnWidths.vencimiento}`}>{new Date(p.fechaVencimiento).toLocaleDateString()}</TableCell>
              <TableCell className={`${columnWidths.estado}`}>{
                estadoActual === 'Aprobado' ? <Badge variant="aprobado">{estadoActual}</Badge>
                : estadoActual === 'Pendiente' ? <Badge variant="pendiente">{estadoActual}</Badge>
                : estadoActual === 'Rechazado' ? <Badge variant="rechazado">{estadoActual}</Badge>
                : <Badge variant="destructive">{estadoExpirado}</Badge>
                
                }</TableCell>
              <TableCell className={`${columnWidths.acciones} text-right`}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={estadoActual !== 'Aprobado'}
                  title="Generar Factura"
                  onClick={() => router.push(`/ventas/facturacion/nuevo?presupuestoId=${p.idPresupuesto}`)}
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
                  disabled={estadoActual !== 'Pendiente'}
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
        {presupuestosVisiblesEnPagina.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
              No hay presupuestos que coincidan con la búsqueda.
            </TableCell>
          </TableRow>
        )}
        </DataTable>
      )}
    </>
  )
}