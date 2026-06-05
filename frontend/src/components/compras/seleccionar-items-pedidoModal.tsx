"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItemPedidoOriginal {
  idProducto: number;
  productoId?: number; // Por si viene mapeado diferente de la API
  descripcion: string;
  categoria?: string;
  idCategoria?: number;
  marca?: string;
  cantidad: number;
  precio?: number;
}

interface SeleccionarItemsPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  detallesPedido: ItemPedidoOriginal[];
  itemsSeleccionados: any[];
  onConfirm: (seleccionados: any[]) => void;
}

export function SeleccionarItemsPedidoModal({
  isOpen,
  onClose,
  detallesPedido,
  itemsSeleccionados,
  onConfirm,
}: SeleccionarItemsPedidoModalProps) {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [soloSeleccionados, setSoloSeleccionados] = useState(false);

  // Mapeamos los detalles para normalizar campos y controlar checkboxes internos
  const [productosEstado, setProductosEstado] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Crear un Set de IDs seleccionados actualmente en el formulario padre
    const seleccionadosIds = new Set(
      itemsSeleccionados.map((i) => i.productoId || i.idProducto),
    );

    const productosNormalizados = detallesPedido.map((d) => {
      const idProd = d.idProducto || d.productoId || 0;
      return {
        idProducto: idProd,
        descripcion: d.descripcion,
        categoria: d.categoria || "—",
        idCategoria: d.idCategoria || 0,
        marca: d.marca || "—",
        cantidadOriginal: Number(d.cantidad),
        marcado: seleccionadosIds.has(idProd),
      };
    });

    setProductosEstado(productosNormalizados);
  }, [isOpen, detallesPedido, itemsSeleccionados]);

  const toggleSeleccion = (idProducto: number) => {
    setProductosEstado((prev) =>
      prev.map((p) =>
        p.idProducto === idProducto ? { ...p, marcado: !p.marcado } : p,
      ),
    );
  };

  const cumpleFiltros = (p: any) => {
    const coincideNombre = p.descripcion
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const coincideCategoria = p.categoria
      .toLowerCase()
      .includes(filtroCategoria.toLowerCase());
    return coincideNombre && coincideCategoria;
  };

  const obtenerProductosVisibles = () => {
    if (soloSeleccionados) {
      return productosEstado.filter((p) => p.marcado && cumpleFiltros(p));
    }
    return productosEstado.filter(cumpleFiltros);
  };

  const cantidadSeleccionadosTotales = productosEstado.filter(
    (p) => p.marcado,
  ).length;
  const productosVisibles = obtenerProductosVisibles();

  const handleGuardar = () => {
    const seleccionados = productosEstado.filter((p) => p.marcado);
    onConfirm(seleccionados);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!w-[90vw] md:!w-[85vw] md:!max-w-4xl max-h-[92vh] flex flex-col p-5 overflow-hidden gap-0">
        {/* Header Compacto */}
        <DialogHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <DialogTitle className="text-lg font-bold tracking-tight">
            Productos del Pedido Origen
          </DialogTitle>
        </DialogHeader>

        {/* Contenedor de Filtros en una Fila */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-muted/40 p-1.5 rounded-lg border">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                className="h-8 text-xs pl-8 w-full bg-background"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
            </div>

            <Input
              placeholder="Filtrar categoría..."
              className="h-8 text-xs w-full sm:w-48 bg-background"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            />

            {/* Selector de Seleccionados */}
            <div className="flex items-center gap-2 bg-background border px-2.5 h-8 rounded-md shadow-sm w-full sm:w-auto justify-center">
              <input
                type="checkbox"
                id="modalSoloSeleccionados"
                className="size-3.5 accent-primary cursor-pointer rounded"
                checked={soloSeleccionados}
                onChange={(e) => setSoloSeleccionados(e.target.checked)}
              />
              <label
                htmlFor="modalSoloSeleccionados"
                className="text-[11px] font-bold uppercase cursor-pointer select-none whitespace-nowrap"
              >
                Seleccionados ({cantidadSeleccionadosTotales})
              </label>
            </div>
          </div>

          {/* Tabla de Productos Compacta */}
          <div className="overflow-x-auto rounded-lg border shadow-sm bg-background">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="h-8">
                  <TableHead className="w-16 h-8 py-0.5 text-xs">ID</TableHead>
                  <TableHead className="h-8 py-0.5 text-xs max-w-[280px]">
                    Descripción
                  </TableHead>
                  <TableHead className="h-8 py-0.5 text-xs">
                    Categoría
                  </TableHead>
                  <TableHead className="w-24 text-center h-8 py-0.5 text-xs">
                    Cant. Pedida
                  </TableHead>
                  <TableHead className="w-24 text-center h-8 py-0.5 text-xs">
                    Incluir
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosVisibles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8 text-xs"
                    >
                      No hay productos que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  productosVisibles.map((p) => (
                    <TableRow
                      key={p.idProducto}
                      className={`h-9 ${
                        p.marcado
                          ? "bg-primary/5 hover:bg-primary/10 transition-colors"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <TableCell className="font-mono text-[11px] text-muted-foreground py-0.5">
                        #{p.idProducto}
                      </TableCell>
                      <TableCell
                        className="font-medium text-xs py-0.5 max-w-[280px] truncate"
                        title={p.descripcion}
                      >
                        {p.descripcion}
                      </TableCell>
                      <TableCell className="text-xs py-0.5">
                        {p.categoria}
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs py-0.5">
                        {p.cantidadOriginal}
                      </TableCell>
                      <TableCell className="text-center py-0.5">
                        <input
                          type="checkbox"
                          className="size-3.5 accent-primary cursor-pointer"
                          checked={p.marcado}
                          onChange={() => toggleSeleccion(p.idProducto)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="flex gap-2 justify-end pt-2 border-t mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs shadow-sm"
            onClick={handleGuardar}
          >
            Aceptar Selección ({cantidadSeleccionadosTotales})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
