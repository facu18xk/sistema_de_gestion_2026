"use client"

import { useState, useEffect } from "react"
import { Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell, TableHead } from "@/components/ui/table"
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useRouter } from "next/navigation"
import { notasCreditosVentasAPI } from "@/services/notasCreditosVentasAPI"
import { facturasAPI } from "@/services/facturasAPI"
import { FacturaVentaCabecera, NotaCreditoVenta } from "@/types/types"
import { notify } from "@/lib/notifications"
import { formatearNumeroFactura } from "@/utils/factura-format"
import { formatearNumeroNotaCredito } from "@/utils/nota-format"

export default function DevolucionesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [facturas, setFacturas] = useState<FacturaVentaCabecera[]>([]);
  const [notasCredito, setNotasCredito] = useState<NotaCreditoVenta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  //const fechaHoy = new Date().toISOString().split('T')[0];

  // 1. CARGA DE DATOS INICIAL
  const cargarPagina = async () => {
    setIsLoading(true)
    try {
      const resPaginada = await notasCreditosVentasAPI.getAll(currentPage, itemsPerPage);
      setNotasCredito(resPaginada.items);
      setTotalPages(resPaginada.totalPages);
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
        setTotalPages(resPaginada.totalPages);
      } catch (error) {
        console.error("Error al cargar las facturas:", error)
        notify.error("Error de conexión", "No se pudo obtener la lista de facturas.")
      }
  }

  useEffect(() => { cargarPagina() }, [currentPage]);
  useEffect(() => { cargarFacturas() }, []);

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
          {notasCredito.map((nota) => {
          const facturaAsociada = facturas.find((f) => f.idFacturaVenta == nota.idFacturaVenta);
          return (
            <TableRow key={nota.idNotaCreditoVenta}>
              <TableCell>{formatearNumeroNotaCredito(nota.idNotaCreditoVenta)}</TableCell>
              <TableCell>{formatearNumeroFactura(facturaAsociada?.idFacturaVenta ?? 0)}</TableCell>
              <TableCell className="font-medium">{facturaAsociada?.cliente}</TableCell>
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
        {notasCredito.length === 0 && (
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
