"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Eye, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useRouter } from "next/navigation"
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI"
import { facturasAPI } from "@/services/facturasAPI"
import { FacturaVentaCabecera, NotaCreditoVenta, NotaConCliente } from "@/types/types"
import { notify } from "@/lib/notifications"

export default function DevolucionesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [facturas, setFacturas] = useState<FacturaVentaCabecera[]>([]);
  const [todasLasNotas, setTodasLasNotas] = useState<NotaCreditoVenta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  //const fechaHoy = new Date().toISOString().split('T')[0];

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await notasCreditosVentasAPI.getAll(1, 200);
      setTodasLasNotas(resPaginada.items);
    } catch (error) {
      console.error("Error al cargar notas de crédito:", error)
      notify.error("Error de conexión", "No se pudo obtener la lista de notas de crédito.")
    } finally {
      setIsLoading(false)
    }
  }

  const cargarFacturas = async () => {
    try {
        const resPaginada = await facturasAPI.getAll(1, 200);
        setFacturas(resPaginada.items);
      } catch (error) {
        console.error("Error al cargar las facturas:", error)
        notify.error("Error de conexión", "No se pudo obtener la lista de facturas.")
      }
  }

  //useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarPagina(), cargarFacturas() }, []);

  const notasConCliente: NotaConCliente[] = useMemo(() => {
    if (todasLasNotas.length === 0) return [];
    const mapaFacturas = new Map(facturas.map(f => [f.idFacturaVenta, f]));
    return todasLasNotas.map((nota): NotaConCliente => {
      const factura = mapaFacturas.get(nota.idFacturaVenta);
      return {
        ...nota,
        idCliente: factura?.idCliente ?? 0,
        cliente: factura?.cliente ?? "Cliente no encontrado"
      };
    });
  }, [todasLasNotas, facturas]);
  
  //FILTRO DE BÚSQUEDA
  const notasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return notasConCliente;
    
    const query = searchTerm.toLowerCase().trim();
    return notasConCliente.filter(nota => 
      nota.nroComprobante.toLowerCase().includes(query) ||
      nota.facturaVenta.toLowerCase().includes(query) ||
      nota.estado.toLowerCase().includes(query) ||
      nota.cliente.toLowerCase().includes(query) // <-- ¡Ahora puedes buscar por cliente!
    );
  }, [searchTerm, notasConCliente]);

  const totalPages = Math.ceil(notasFiltradas.length / itemsPerPage) || 1;

  const notasVisiblesEnPagina = useMemo(() => {
    const primerItemIndex = (currentPage - 1) * itemsPerPage;
    const ultimoItemIndex = primerItemIndex + itemsPerPage;
    return notasFiltradas.slice(primerItemIndex, ultimoItemIndex);
  }, [currentPage, notasFiltradas]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <>
      {/*BREADCRUMB*/}
      <PageBreadcrumb steps={[{ label: "Ventas", href: "#" }, { label: "Devoluciones" }]} />
      {/*BOTÓN ADD*/}
      <PageHeader
        title="Listado de Notas de Crédito"
        buttonLabel="Nueva Nota de Crédito"
        onButtonClick={() => router.push('/ventas/devoluciones/nuevo')}
      />
      {/* INPUT DEL BUSCADOR LOCAL */}
      <div className="my-4 flex items-center max-w-md relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nota crédito, factura, cliente o estado..."
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
          caption="Lista de notas de crédito."
          headerRow={
            <TableRow>
              <TableHead>Nota Crédito</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        >
          {notasVisiblesEnPagina.map((nota) => {
          //const facturaAsociada = facturas.find((f) => f.idFacturaVenta == nota.idFacturaVenta);

          return (
            <TableRow key={nota.idNotaCreditoVenta}>
              <TableCell>{nota.nroComprobante}</TableCell>
              <TableCell>{nota.facturaVenta}</TableCell>
              <TableCell className="font-medium">{nota.cliente}</TableCell>
              <TableCell>{new Date(nota.fechaEmision).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Ver Nota Crédito"
                  onClick={() => router.push(`/ventas/devoluciones/${nota.idNotaCreditoVenta}`)}
                >
                  <Eye className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
        {notasVisiblesEnPagina.length === 0 && (
                <TableRow>
                <TableCell className="py-12 text-center text-muted-foreground text-sm" colSpan={5}>
                  No hay notas de crédito para mostrar.
                </TableCell>
                </TableRow>
              )}
        </DataTable>
      )}
    </>
  )
}
