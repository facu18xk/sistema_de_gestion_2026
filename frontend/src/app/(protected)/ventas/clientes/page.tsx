"use client"

import { Cliente, ClienteSaveDTO, Pais } from "@/types/types"
import { useState, useEffect } from "react"
import { Pencil, Trash2, Loader2 } from "lucide-react"
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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null)
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null)
  const [paises, setPaises] = useState<Pais[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)

  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await clientesAPI.getAll(currentPage, itemsPerPage);
      setClientes(resPaginada.items);
      //console.log(resPaginada);
      setTotalPages(resPaginada.totalPages);
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

  useEffect(() => { cargarPaises() }, []);
  useEffect(() => { cargarPagina() }, [currentPage]);

  // 2. ACCIONES (CREAR / EDITAR / ELIMINAR)
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
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Clientes" }]} />
      <PageHeader
        title="Listado de Clientes"
        buttonLabel="Nuevo Cliente"
        onButtonClick={handleCrearNuevo}
      />
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

      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <DataTable
          caption="Lista de clientes."
          headerRow={
            <TableRow>
              <TableHead>Nombres</TableHead>
              <TableHead>Apellidos</TableHead>
              <TableHead>CI/RUC</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {clientes.map((c) => (
            <TableRow key={c.idCliente}>
              <TableCell className="text-foreground">{c.nombres}</TableCell>
              <TableCell>{c.apellidos}</TableCell>
              <TableCell className="font-mono text-sm">{formatRUC(c.ruc) || formatCI(c.ci) || "Sin especificar"}</TableCell>
              <TableCell>
                <span className="text-sm">{c.correo || "Sin correo"}</span>
              </TableCell>
              <TableCell className="text-sm">
                {formatPhone(c.telefono) || "Sin teléfono"}
              </TableCell>
              <TableCell className="text-right space-x-1">
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
        </DataTable>
      )}

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