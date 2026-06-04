"use client"

import { useState, useEffect, useMemo } from "react"
import { Pencil, Trash2, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductoForm } from "@/components/stock/producto-form"
import { Input } from "@/components/ui/input"
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

import { productosAPI } from "@/services/productosAPI"
import { marcasAPI } from "@/services/marcasAPI"
import { categoriasAPI } from "@/services/categoriasAPI"
import { ProductoDTO, ProductoSaveDTO, Marca, Categoria } from "@/types/types"
import { formatGuaranies } from "@/utils/money-format"
import { notify } from "@/lib/notifications"
import { formatearNumeroProducto } from "@/utils/producto-format"

const columnWidths = {
  codigo: "w-[80px]",
  descripcion: "w-[25%]",
  marca: "w-[100px]",
  categoria: "w-[100px]",
  precio: "w-[100px]",
  stock: "w-[80px]",
  acciones: "w-[80px]",
};

export default function ProductosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  //const [productos, setProductos] = useState<ProductoDTO[]>([])
  const [todosLosProductos, setTodosLosProductos] = useState<ProductoDTO[]>([]);
  const [productoAEditar, setProductoAEditar] = useState<ProductoDTO | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoDTO | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true);
    try {
      const [resPaginada, resMarcas, resCategorias] = await Promise.all([
        productosAPI.getAll(currentPage, 100),
        marcasAPI.getAll(),
        categoriasAPI.getAll()
      ])
      //setProductos(resPaginada.items);
      const soloProductos = resPaginada.items.filter((s) => s.esServicio === false);
      const ordenados = [...soloProductos].sort((a, b) => {
        const porDescripcion = a.descripcion.localeCompare(b.descripcion, 'es-PY');
        if (porDescripcion === 0) {
          return a.marca.localeCompare(b.marca, 'es-PY');
        }
        return porDescripcion;
      });
      setTodosLosProductos(ordenados);
      //console.log(resPaginada.items)
      //setTotalPages(resPaginada.totalPages);
      setMarcas(resMarcas.items);
      setCategorias(resCategorias);
    } catch (error) {
      console.error("Error al cargar datos de la página:", error);
      notify.error ("Error", "Error al cargar la página");
    } finally {
      setIsLoading(false);
    }
  }

  const cargarMarcas = async () => {
    try {
      const response = await marcasAPI.getAll();
      setMarcas(response.items);
    } catch (error) {
      console.error("Error al cargar datos de marcas:", error);
      notify.error ("Error", "Error al cargar las marcas");
    }
  }

  const cargarCategorias = async () => {
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response);
    } catch (error) {
      console.error("Error al cargar datos de categorías:", error);
      notify.error ("Error", "Error al cargar las categorías");
    }
  }

  //useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarPagina() }, []);

  //FILTRO DE BÚSQUEDA
  const productosFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return todosLosProductos;
    
    const query = searchTerm.toLowerCase().trim();
    return todosLosProductos.filter(p => 
      p.descripcion.toLowerCase().includes(query) || 
      formatearNumeroProducto(p.idProducto).toLowerCase().toString().includes(query) ||
      (p.marca && p.marca.toLowerCase().includes(query)) ||
      (p.categoria && p.categoria.toLowerCase().includes(query))
    );
  }, [searchTerm, todosLosProductos]);

  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage) || 1;

  const productosVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return productosFiltrados.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, productosFiltrados]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  //ACCIONES (CREAR / EDITAR / ELIMINAR)
  const handleCrearNuevo = () => { setProductoAEditar(null); setIsSheetOpen(true); }
  
  const handleEditar = (p: ProductoDTO) => { setProductoAEditar(p); setIsSheetOpen(true); }

  const confirmarEliminacion = async () => {
    if (productoAEliminar) {
      try {
        await productosAPI.delete(productoAEliminar.idProducto);
        notify.success("Eliminado", "Producto quitado del stock");
        await cargarPagina(); // Recarga la página actual
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        notify.error("Error", "No se pudo eliminar. El producto tiene objetos asociados.");
      } finally {
        setIsAlertOpen(false);
        setProductoAEliminar(null);
      }
    }
  };

  const handleFormSubmit = async (data: ProductoSaveDTO) => {
    try {
      if (productoAEditar) {
        //console.log(data);
        await productosAPI.update(productoAEditar.idProducto, data)
        notify.success("Actualizado", "Producto actualizado correctamente.");
      } else {
        //console.log(data);
        await productosAPI.create(data)
        notify.success("Registrado", "Nuevo producto guardado.");
      }
      setIsSheetOpen(false)
      cargarPagina() // Refrescar la tabla
    } catch (error) {
      console.error("Error al guardar:", error)
      notify.error("Error", "No se pudo procesar la solicitud.")
    }
  }

  //console.log(productoAEliminar)

  return (
    <> {/*src/app/(protected)/layout.tsx ya contiene Navbar y div Container*/}
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Stock", href: "#" }, { label: "Productos" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader title="Listado de Productos" buttonLabel="Nuevo Producto" onButtonClick={handleCrearNuevo} />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descripción, marca o categoría..."
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
            Esta acción no se puede deshacer. Eliminarás permanentemente el producto{" "}
            <span className="font-bold text-foreground">
              "{productoAEliminar?.descripcion}"
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
            Eliminar Producto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
      {/*TABLA*/}
      {isLoading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
      ) : (
        <DataTable
          caption="Lista actualizada de productos en inventario."
          headerRow={
            <TableRow>
              <TableHead className={`${columnWidths.codigo}`}>Código</TableHead>
              <TableHead className={`${columnWidths.descripcion}`}>Descripción</TableHead>
              <TableHead className={`${columnWidths.marca}`}>Marca</TableHead>
              <TableHead className={`${columnWidths.categoria}`}>Categoría</TableHead>
              <TableHead className={`${columnWidths.precio} text-right`}>Precio Unit.</TableHead>
              <TableHead className={`${columnWidths.stock} text-right`}>Stock Total</TableHead>
              <TableHead className={`${columnWidths.acciones} text-right`}>Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {productosVisiblesEnPagina.map((p) => (
            <TableRow key={p.idProducto}>
              <TableCell className={`${columnWidths.codigo}`}>{formatearNumeroProducto(p.idProducto)}</TableCell>
              <TableCell className={`${columnWidths.descripcion}`}>{p.descripcion}</TableCell>
              <TableCell className={`${columnWidths.marca}`}>{p.marca}</TableCell>
              <TableCell className={`${columnWidths.categoria}`}>{p.categoria}</TableCell>
              <TableCell className={`${columnWidths.precio} text-right`}>{formatGuaranies(p.precioUnitario)}</TableCell>
              <TableCell className={`${columnWidths.stock} text-right font-semibold ${p.cantidadTotal <= 4 ? "text-red-500" : ""}`}>{p.cantidadTotal}</TableCell>
              <TableCell className={`${columnWidths.acciones} text-right space-x-1`}>
                <Button variant="ghost" size="icon" onClick={() => handleEditar(p)} className="cursor-pointer">
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {setProductoAEliminar(p); setIsAlertOpen(true);}} className="cursor-pointer">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {productosVisiblesEnPagina.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                No hay productos que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </DataTable>
      )}
      {/*SHEET LATERAL*/}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="px-6 sm:max-w-[540px] sm:min-w-[450px]">
          <SheetHeader className="border-b pt-4">
            <SheetTitle>{productoAEditar ? "Editar Producto" : "Nuevo Producto"}</SheetTitle>
            <SheetDescription>Completa la información del inventario.</SheetDescription>
          </SheetHeader>
          <ProductoForm
            key={productoAEditar?.idProducto ?? "nuevo"}
            productoEditado={productoAEditar}
            categorias={categorias} 
            marcas={marcas}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
            onRefreshData={async () => {
              await cargarMarcas();
              await cargarCategorias();
           }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
