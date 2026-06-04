"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PedidoItem } from "@/components/compras/pedido-form";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const formatearGs = (valor: number) => {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0
  }).format(valor);
};

interface PedidoItemsTableProps {
  items: PedidoItem[];
  readOnly?: boolean;
  onUpdateItem: (
    index: number,
    field: keyof PedidoItem,
    value: string | number,
  ) => void;
  onDeleteItem: (index: number) => void;
}

export function PedidoItemsTable({
  items,
  onUpdateItem,
  onDeleteItem,
  readOnly = false,
}: PedidoItemsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const itemsPaginados = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">Cantidad</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            {!readOnly && <TableHead className="w-[80px] text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={readOnly ? 3 : 4}
                className="text-center text-muted-foreground h-24"
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
                    {readOnly ? (
                      <span className="inline-block px-3 py-1">{item.cantidad}</span>
                    ) : (
                      <Input
                        type="number"
                        value={item.cantidad === 0 ? "" : item.cantidad}
                        placeholder="0"
                        className="h-8 w-20"
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          onUpdateItem(realIndex, "cantidad", val);
                        }}
                      />
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-4 text-sm">
                    {item.descripcion}
                  </TableCell>

                  <TableCell className="py-3 px-4 text-sm">
                    {item.categoria}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-right">
                    {formatearGs(item.precio || 0)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteItem(realIndex)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {items.length > itemsPerPage && (
        <div className="flex justify-start items-center gap-3 p-3 border-t">
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