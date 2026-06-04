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
  items: CotizacionItemForm[];         // Elementos paginados visibles en la tabla
  allItems: CotizacionItemForm[];      // Lista COMPLETA de ítems para calcular el total real global
  onUpdateItem: (index: number, field: keyof CotizacionItemForm, value: any) => void;
  onDeleteItem: (index: number) => void;
  isViewOnly?: boolean;
}

export function CotizacionItemsTable({
  items,
  allItems,
  onUpdateItem,
  onDeleteItem,
  isViewOnly = false
}: Props) {

  // CORRECCIÓN: Calcula el total real basándose en toda la colección de productos
  const totalGeneral = allItems.reduce((acc, item) => {
    const subtotalItem = Number(item.cantidad) * (Number(item.precioUnitario || 0) - Number(item.descuento || 0));
    return acc + (subtotalItem > 0 ? subtotalItem : 0);
  }, 0);

  const formatToGs = (value: number | string) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return "";
    return num.toLocaleString("es-PY");
  };

  const parseFromGs = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    return cleanValue ? Number(cleanValue) : 0;
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Descripción del Producto</TableHead>
            <TableHead className="w-[120px] text-center">Cantidad</TableHead>
            <TableHead className="w-[160px] text-center">Precio Unit. (Gs.)</TableHead>
            <TableHead className="w-[160px] text-center">Descuento (Gs.)</TableHead>
            <TableHead className="w-[150px] text-right">Subtotal (Gs.)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
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
                      disabled={isViewOnly}
                      className="w-20 mx-auto h-8 text-center disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="0"
                      value={formatToGs(item.precioUnitario || 0)}
                      onChange={(e) => {
                        const valorLimpio = parseFromGs(e.target.value);
                        onUpdateItem(index, "precioUnitario", valorLimpio);
                      }}
                      disabled={isViewOnly}
                      className="w-36 mx-auto h-8 text-right font-mono font-semibold text-emerald-700 disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="0"
                      value={formatToGs(item.descuento || 0)}
                      onChange={(e) => {
                        const valorLimpio = parseFromGs(e.target.value);
                        onUpdateItem(index, "descuento", valorLimpio);
                      }}
                      disabled={isViewOnly}
                      className="w-36 mx-auto h-8 text-right font-mono font-semibold text-amber-700 disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-slate-900">
                    {subtotal.toLocaleString("es-PY")}
                  </TableCell>
                  <TableCell>
                    {!isViewOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => onDeleteItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        {/* El pie de tabla ahora siempre representará el valor global correcto */}
        {allItems.length > 0 && (
          <tfoot>
            <TableRow className="bg-slate-50/80 font-bold border-t">
              <TableCell colSpan={5} className="text-right text-slate-700 uppercase text-xs tracking-wider">
                Total Cotización:
              </TableCell>
              <TableCell className="text-right text-base text-slate-900 font-mono font-black">
                {totalGeneral.toLocaleString("es-PY")} <span className="text-xs font-normal text-muted-foreground ml-1">Gs.</span>
              </TableCell>
              <TableCell />
            </TableRow>
          </tfoot>
        )}
      </Table>
    </div>
  );
}