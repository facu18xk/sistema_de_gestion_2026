"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Loader2 } from "lucide-react";
import { cotizacionesAPI } from "@/services/cotizacionesAPI";
import { CotizacionDTO } from "@/types/types";
import { notify } from "@/lib/notifications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<CotizacionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarPagina = async (numPagina: number) => {
    setIsLoading(true);
    try {
      const res = await cotizacionesAPI.getAll(numPagina, 10);
      console.log(res);

      const itemsCargados = res.items || res || [];
      setCotizaciones(itemsCargados);

      setTotalPaginas(res.totalPages || 1);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
      notify.error("Error de carga", "No se pudo recuperar el listado del servidor.");
      setCotizaciones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarPagina(pagina);
  }, [pagina]);

  return (
    <div className="bg-background">

      <PageBreadcrumb
        steps={[{ label: "Compras" }, { label: "Cotizaciones" }]}
      />

      <main className="container p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold tracking-tight">Listado de Cotizaciones</h2>
          <Link href="/compras/cotizaciones/nuevo">
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>

        {isLoading ? (
          /* Estado de Carga UI */
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Obteniendo registros del servidor...
            </p>
          </div>
        ) : (
          /* Tabla de Registros */
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-32">Nro Cotización</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="w-36">Fecha</TableHead>
                  <TableHead className="w-32">Estado</TableHead>
                  <TableHead className="w-24 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-foreground">
                      No se encontraron cotizaciones registradas.
                    </TableCell>
                  </TableRow>
                ) : (
                  cotizaciones.map((c) => (
                    <TableRow key={c.idPedidoCotizacion} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">
                        #{c.idPedidoCotizacion}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {c.proveedor?.razonSocial || "Proveedor no asignado"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.fecha ? c.fecha.substring(0, 10) : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                          {c.estado || `Estado ${c.idEstado}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/compras/cotizaciones/${c.idPedidoCotizacion}/editar`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-3 bg-muted/20 border-t text-xs">
              <span className="text-muted-foreground">
                Página <b>{pagina}</b> de {totalPaginas}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}