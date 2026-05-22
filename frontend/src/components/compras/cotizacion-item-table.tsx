"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CotizacionItemForm } from "@/types/types";

interface Props {
  items: CotizacionItemForm[];
  onUpdateItem: (index: number, field: keyof CotizacionItemForm, value: any) => void;
  onDeleteItem: (index: number) => void;
}

export function CotizacionItemsTable({ items, onUpdateItem, onDeleteItem }: Props) {

  // Cálculo del total general para mostrarlo al pie de la tabla
  const totalGeneral = items.reduce((acc, item) => {
    return acc + (Number(item.cantidad) * (Number(item.precioUnitario || 0) - Number(item.descuento || 0)));
  }, 0);

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Descripción del Producto</TableHead>
            <TableHead className="w-[120px] text-center">Cantidad</TableHead>
            <TableHead className="w-[150px] text-center">Precio Unit. (Gs.)</TableHead>
            <TableHead className="w-[150px] text-center">Descuento (Gs.)</TableHead>
            <TableHead className="w-[150px] text-right">Subtotal (Gs.)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                No hay productos seleccionados. Usa el buscador o elige un pedido.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => {
              const subtotal = Number(item.cantidad) * (Number(item.precioUnitario || 0) - Number(item.descuento || 0));

              return (
                <TableRow key={`${item.productoId}-${index}`} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-500">
                    {item.productoId}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-700">{item.descripcion}</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.cantidad}
                      onChange={(e) => onUpdateItem(index, "cantidad", Number(e.target.value))}
                      className="w-20 mx-auto h-8 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={10000}
                      placeholder="0"
                      value={item.precioUnitario || ""}
                      onChange={(e) => onUpdateItem(index, "precioUnitario", Number(e.target.value))}
                      className="w-32 mx-auto h-8 text-right font-medium text-green-700"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={item.descuento || ""}
                      onChange={(e) => onUpdateItem(index, "descuento", Number(e.target.value))}
                      className="w-32 mx-auto h-8 text-right font-medium text-green-700"
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {subtotal.toLocaleString("es-PY")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        {items.length > 0 && (
          <tfoot>
            <TableRow className="bg-slate-50/80 font-bold">
              <TableCell colSpan={4} className="text-right text-slate-700 uppercase text-xs tracking-wider">
                Total Cotización:
              </TableCell>
              <TableCell className="text-right text-lg text-primary">
                {totalGeneral.toLocaleString("es-PY")} <span className="text-xs ml-1">Gs.</span>
              </TableCell>
              <TableCell />
            </TableRow>
          </tfoot>
        )}
      </Table>
    </div>
  );
}