"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PedidoItem } from "@/components/compras/pedido-form";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface PedidoItemsTableProps {
  items: PedidoItem[];
  readOnly?: boolean;
  onUpdateItem: (
    index: number,
    field: keyof PedidoItem,
    value: string | number,
  ) => void;
}

export function PedidoItemsTable({
  items,
  onUpdateItem,
  readOnly = false,
}: PedidoItemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const itemsPaginados = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="overflow-x-auto rounded-md ">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Cantidad</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No hay productos agregados.
              </TableCell>
            </TableRow>
          ) : (
            itemsPaginados.map((item, index) => {
              const realIndex = (currentPage - 1) * itemsPerPage + index;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.cantidad}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100" : ""}
                      onChange={(e) =>
                        onUpdateItem(index, "cantidad", Number(e.target.value))
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      value={item.descripcion}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100" : ""}
                      onChange={(e) =>
                        onUpdateItem(index, "descripcion", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      value={item.categoria}
                      readOnly={readOnly}
                      className={readOnly ? "bg-gray-100" : ""}
                      onChange={(e) =>
                        onUpdateItem(index, "categoria", e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {items.length > itemsPerPage && (
        <div className="flex justify-start items-center gap-3 p-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>

          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
