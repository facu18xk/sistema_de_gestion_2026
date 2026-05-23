"use client";

import { useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { asientosAPI } from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import { AsientoDTO } from "@/types/types";

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PY").format(new Date(value));
}

export default function AsientosPage() {
  const router = useRouter();
  const [asientos, setAsientos] = useState<AsientoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const cargarAsientos = async () => {
    setIsLoading(true);
    try {
      const response = await asientosAPI.getAll(currentPage, itemsPerPage);
      setAsientos(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error al cargar asientos:", error);
      notify.error(
        "Error de conexión",
        "No se pudo obtener la lista de asientos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarAsientos();
  }, [currentPage]);

  return (
    <>
      <PageBreadcrumb
        steps={[{ label: "Contabilidad", href: "#" }, { label: "Asientos" }]}
      />
      <PageHeader
        title="Asientos Contables"
        buttonLabel="Nuevo Asiento"
        onButtonClick={() => router.push("/contabilidad/asientos/nuevo")}
      />

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <DataTable
          caption="Listado de asientos contables."
          headerRow={
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Automático</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          }
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        >
          {asientos.map((asiento) => (
            <TableRow key={asiento.idAsiento}>
              <TableCell className="font-mono">
                {asiento.numeroAsiento}
              </TableCell>
              <TableCell>{formatDate(asiento.fecha)}</TableCell>
              <TableCell>
                {asiento.periodoContable ?? asiento.idPeriodoContable ?? "-"}
              </TableCell>
              <TableCell className="max-w-[360px] truncate">
                {asiento.descripcion ?? "-"}
              </TableCell>
              <TableCell>{asiento.estado}</TableCell>
              <TableCell>{asiento.automatico ? "Sí" : "No"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  className="cursor-pointer"
                >
                  <Eye className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
    </>
  );
}
