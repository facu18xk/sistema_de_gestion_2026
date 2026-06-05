"use client"

import { useState, useEffect, useMemo } from "react"
import { Loader2, Eye, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useRouter } from "next/navigation"
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI"
import { facturasAPI } from "@/services/facturasAPI"
import { FacturaVentaCabecera, NotaCreditoVenta, NotaConCliente } from "@/types/types"
import { notify } from "@/lib/notifications"
import { formatearNumeroFactura } from "@/utils/factura-format"
import { formatearNumeroNotaCredito, formatearTimbradoNota } from "@/utils/nota-format";
import { Badge } from "@/components/ui/badge";
import { formatGuaranies } from "@/utils/money-format"
import { formatearFecha } from "@/utils/date-utils"

const columnWidths = {
  nota: "w-[140px]",
  factura: "w-[140px]",
  cliente: "w-[130px]",
  fecha: "w-[100px]",
  estado: "w-[100px]",
  total: "w-[100px]",
  acciones: "w-[80px]",
};

export default function DevolucionesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [facturas, setFacturas] = useState<FacturaVentaCabecera[]>([]);
  const [notasCredito, setNotasCredito] = useState<NotaCreditoVenta[]>([]);
  const [todasLasNotas, setTodasLasNotas] = useState<NotaCreditoVenta[]>([]);
  const [notas, setNotas] = useState<NotaConCliente[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  //const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("")

  //const fechaHoy = new Date().toISOString().split('T')[0];

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await notasCreditosVentasAPI.getAll(currentPage, itemsPerPage);
      //setNotasCredito(resPaginada.items);
      const ordenados = [...resPaginada.items].sort((a, b) => {
        // --- CRITERIO 1: ESTADO (Mandar 'Anulado' al final) ---
        if (a.estado === 'Anulado' && b.estado !== 'Anulado') return 1;
        if (a.estado !== 'Anulado' && b.estado === 'Anulado') return -1;

        // --- CRITERIO 2: NRO COMPROBANTE (Descendente) ---
        return b.nroComprobante.localeCompare(a.nroComprobante, 'es-PY');
      });
      setTodasLasNotas(ordenados);
      //setTotalPages(resPaginada.totalPages);
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
        //setTotalPages(resPaginada.totalPages);
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
      nota.cliente.toLowerCase().includes(query) ||
      formatearFecha(nota.fechaEmision).toLowerCase().includes(query)
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
            placeholder="Buscar por nota crédito, factura, cliente, fecha o estado..."
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
              <TableHead className={`${columnWidths.nota}`}>Nota Crédito</TableHead>
              <TableHead className={`${columnWidths.factura}`}>Factura</TableHead>
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
          {notasVisiblesEnPagina.map((nota) => {
          //const facturaAsociada = facturas.find((f) => f.idFacturaVenta == nota.idFacturaVenta);
          const estadoActual = nota.estado;
          const totalNota = nota.detalles.reduce((acc, item) => {
            return acc + (item.subtotal);
          }, 0);

          return (
            <TableRow key={nota.idNotaCreditoVenta}>
              <TableCell>{nota.nroComprobante}</TableCell>
              <TableCell>{nota.facturaVenta}</TableCell>
              <TableCell className="font-medium">{nota.cliente}</TableCell>
              <TableCell>{formatearFecha(nota.fechaEmision)}</TableCell>
              <TableCell className={`${columnWidths.estado}`}>{
                estadoActual === 'Emitido' ? <Badge variant="aprobado">{estadoActual}</Badge> : 
                <Badge variant="destructive">{estadoActual}</Badge>}
              </TableCell>
              <TableCell className={`${columnWidths.acciones} text-right`}>{formatGuaranies(totalNota)}</TableCell>
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
          <TableCell className="py-12 text-center text-muted-foreground text-sm" colSpan={7}>
            No hay notas de crédito para mostrar.
          </TableCell>
          </TableRow>
        )}
        </DataTable>
      )}
    </>
  )
}
