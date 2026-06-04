"use client"

import { Cliente, ClienteSaveDTO, Pais } from "@/types/types"
import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ClienteForm } from "@/components/ventas/clientes-form"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
import { clientesAPI } from "@/services/clientesAPI"
import { ubicacionesAPI } from "@/services/ubicacionesAPI"
import { notify } from "@/lib/notifications"
import { formatPhone, maskPhoneInput } from "@/utils/phone-format"
import { formatCI, formatRUC, maskCIInput, maskRUCInput } from "@/utils/cedula-format"

const columnWidths = {
  nombre: "w-[150px]",
  apellido: "w-[150px]",
  ciRuc: "w-[120px]",
  correo: "w-[220px]",
  telefono: "w-[120px]",
  stock: "w-[80px]",
  acciones: "w-[80px]",
};

/*const resPaginada = {
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
      "nombres": "Facundo Axel",
      "apellidos": "Potter",
      "correo": "facundo.potter@gmail.com",
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
      "nombres": "John",
      "apellidos": "Doe",
      "correo": "john.doe@gmail.com",
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
      "nombres": "Frank",
      "apellidos": "Maxell",
      "correo": "frank.maxell@gmail.com",
      "telefono": "0985345345",
    },
    {
      "idCliente": 4,
      "ci": "3123123",
      "ruc": "",
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
      "nombres": "Chester",
      "apellidos": "Higgins",
      "correo": "chester.higgins@gmail.com",
      "telefono": "0985345345",
    },
    {
      "idCliente": 5,
      "ci": "",
      "ruc": "",
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
      "nombres": "Kevin",
      "apellidos": "Chen",
      "correo": "kevin.chen@gmail.com",
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

export default function ProveedoresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  //const [clientes, setClientes] = useState<Cliente[]>([])
  const [todosLosClientes, setTodosLosClientes] = useState<Cliente[]>([])
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null)
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)
  const [paises, setPaises] = useState<Pais[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  //const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")

  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await clientesAPI.getAll(currentPage, 100);
      //setClientes(resPaginada.items);
      const ordenados = [...resPaginada.items].sort((a, b) => {
        const nombreComp = a.nombres.localeCompare(b.nombres, 'es-PY');
        if (nombreComp === 0) {
          return a.apellidos.localeCompare(b.apellidos, 'es-PY');
        }
        return nombreComp;
      });
      setTodosLosClientes(ordenados);
      //console.log(resPaginada);
      //setTotalPages(resPaginada.totalPages);
    } catch (error) {
      console.error("Error al cargar datos de clientes:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de clientes.")
    } finally {
      setIsLoading(false)
    }
  }

  const cargarPaises = async () => {
    try {
      const resPaises = await ubicacionesAPI.getPaises();
      setPaises(resPaises.items)
    } catch (error) {
      console.error("Error al cargar datos de países:", error);
      notify.error("Error de conexión", "No se pudo obtener la lista de países.")
    }
  }

  useEffect(() => { cargarPagina(), cargarPaises() }, []);
  //useEffect(() => { cargarPagina() }, [currentPage]);

  //FILTRO DE BÚSQUEDA
  const clientesFiltrados = useMemo(() => {
      if (!searchTerm.trim()) return todosLosClientes;
      
      const query = searchTerm.toLowerCase().trim();
      return todosLosClientes.filter(c => 
        c.nombres.toLowerCase().includes(query) || 
        c.apellidos.toLowerCase().includes(query) || 
        (c.ci && formatCI(c.ci).toString().includes(query)) ||
        (c.ruc && formatRUC(c.ruc).toString().includes(query))
      );
    }, [searchTerm, todosLosClientes]);

    const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage) || 1;

    const clientesVisiblesEnPagina = useMemo(() => {
      const primerItemIndex = (currentPage - 1) * itemsPerPage;
      const ultimoItemIndex = primerItemIndex + itemsPerPage;
      return clientesFiltrados.slice(primerItemIndex, ultimoItemIndex);
    }, [currentPage, clientesFiltrados]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  //ACCIONES (CREAR / EDITAR / ELIMINAR)
  const prepareDataForForm = (rawClient: any) => {
    return {
      ...rawClient,
      ci: maskCIInput(rawClient.ci || ""),
      ruc: maskRUCInput(rawClient.ruc || ""),
      telefono: maskPhoneInput(rawClient.telefono || ""),
    };
  };
  
  const cleanDataForSubmit = (formData: any) => {
    return {
      ...formData,
      // Eliminamos todo lo que no sea dígito
      ci: formData.ci.toString().replace(/\D/g, ""),
      ruc: formData.ruc.toString().replace(/\D/g, ""),
      telefono: formData.telefono.toString().replace(/\D/g, ""),
    };
  };
  
  const handleCrearNuevo = () => { setClienteAEditar(null); setIsSheetOpen(true); }

  const handleEditar = (c: Cliente) => {
    const formattedClient = prepareDataForForm(c);
    setClienteAEditar(formattedClient);
    setIsSheetOpen(true);
  }

  const confirmarEliminacion = async () => {
    if (clienteAEliminar) {
      try {
        await clientesAPI.delete(clienteAEliminar.idCliente)
        notify.success("Eliminado", "El cliente ha sido removido.")
        await cargarPagina()
      } catch (error) {
        notify.error("Error", "No se pudo eliminar el cliente.")
      } finally {
        setIsAlertOpen(false)
        setClienteAEliminar(null)
      }
    }
  }

  const handleFormSubmit = async (formData: any) => {
    try {
      const dataToSave: ClienteSaveDTO = {
        ci: formData.ci,
        ruc: formData.ruc,
        fechaNacimiento: formData.fechaNacimiento,
        nombres: formData.nombres || null,
        apellidos: formData.apellidos || null,
        correo: formData.correo || null,
        telefono: formData.telefono || null,
        direccion: {
          calle1: formData.calle1,
          calle2: formData.calle2 || null,
          descripcion: formData.descripcionDireccion || null,
          idCiudad: Number(formData.idCiudad)
        },
      };
      const cleanData = cleanDataForSubmit(dataToSave);
      if (clienteAEditar) {
        await clientesAPI.update(clienteAEditar.idCliente, cleanData);
        notify.success("Actualizado", "Cliente actualizado correctamente.");
      } else {
        await clientesAPI.create(cleanData);
        notify.success("Registrado", "Nuevo cliente guardado.");
      }
      setIsSheetOpen(false);
      cargarPagina();
    } catch (error) {
      console.error("Error al guardar:", error)
      notify.error("Error", "No se pudo procesar la solicitud.")
    }
  }

  return (
    <>
      {/*  PAGEBREADCRUMB */}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Clientes" }]} />
      {/* BOTÓN ADD */}
      <PageHeader
        title="Listado de Clientes"
        buttonLabel="Nuevo Cliente"
        onButtonClick={handleCrearNuevo}
      />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, apellido o CI/RUC..."
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
              Esta acción no se puede deshacer. Eliminarás permanentemente a{" "}
              <span className="font-bold text-foreground">
                "{clienteAEliminar?.nombres}, {clienteAEliminar?.apellidos}"
              </span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <DataTable
          caption="Lista de clientes."
          headerRow={
            <TableRow>
              <TableHead className={`${columnWidths.nombre} text-foreground`}>Nombres</TableHead>
              <TableHead className={`${columnWidths.apellido}`}>Apellidos</TableHead>
              <TableHead className={`${columnWidths.ciRuc} font-mono text-sm`}>CI/RUC</TableHead>
              <TableHead className={`${columnWidths.correo}`}>Correo</TableHead>
              <TableHead className={`${columnWidths.telefono} text-sm`}>Teléfono</TableHead>
              <TableHead className={`${columnWidths.acciones} text-right space-x-1`}>Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {clientesVisiblesEnPagina.map((c) => (
            <TableRow key={c.idCliente}>
              <TableCell className={`${columnWidths.nombre} text-foreground`}>{c.nombres}</TableCell>
              <TableCell className={`${columnWidths.apellido}`}>{c.apellidos}</TableCell>
              <TableCell className={`${columnWidths.ciRuc} font-mono text-sm`}>{formatRUC(c.ruc) || formatCI(c.ci) || "Sin especificar"}</TableCell>
              <TableCell className={`${columnWidths.correo}`}>{c.correo || "Sin correo"}</TableCell>
              <TableCell className={`${columnWidths.telefono} text-sm`}>
                {formatPhone(c.telefono) || "Sin teléfono"}
              </TableCell>
              <TableCell className={`${columnWidths.acciones} text-right space-x-1`}>
                <Button variant="ghost" size="icon" onClick={() => handleEditar(c)} className="cursor-pointer">
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setClienteAEliminar(c); setIsAlertOpen(true); }}
                  className="cursor-pointer"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {clientesVisiblesEnPagina.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                No hay clientes que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </DataTable>
      )}
      {/*SHEET LATERAL*/}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="px-6 sm:max-w-[540px] sm:min-w-[450px]">
          <SheetHeader className=" border-b pt-4">
            <SheetTitle>{clienteAEditar ? "Editar Cliente" : "Nuevo Cliente"}</SheetTitle>
            <SheetDescription>Información del cliente.</SheetDescription>
          </SheetHeader>
          <ClienteForm
            key={clienteAEditar?.idCliente ?? "nuevo"}
            clienteEditado={clienteAEditar}
            paises={paises}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
            onRefreshPaises={() => cargarPagina()}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
