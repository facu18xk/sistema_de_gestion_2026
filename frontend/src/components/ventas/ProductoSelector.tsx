import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatNumberDots } from "@/utils/money-format";
import { ProductoDTO, PreciosVentas } from "@/types/types";
import { formatearNumeroProducto } from "@/utils/producto-format";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (p: ProductoDTO & { precioVentaVigente?: number }) => void;
  productos: ProductoDTO[];
  precios: PreciosVentas[];
}

export const ProductoSelector = ({ isOpen, onClose, onSelect, productos, precios }: Props) => {
  const [search, setSearch] = useState("");

  const filteredProductos = useMemo(() => {
    const term = search.toLowerCase();
    const filtrados = productos.filter(p => 
      p.descripcion.toLowerCase().includes(term) || 
      formatearNumeroProducto(p.idProducto.toString()).includes(term)
    );
    return filtrados.map(p => {
      const precioAsociado = precios.find(pr => pr.idProducto === p.idProducto && pr.activo === true);
      return {
        ...p,
        precioVentaVigente: precioAsociado ? precioAsociado.precioVenta : p.precioUnitario
      };
    });
  }, [search, productos, precios]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-150 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Producto</DialogTitle>
          <DialogDescription>
            Puede buscar el producto por Nombre o por Código. Haga clic sobre el producto para agregarlo a
            la lista.
          </DialogDescription>
        </DialogHeader>
        
        <Input 
          placeholder="Buscar por nombre o código..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="h-[400px] overflow-y-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-right">Precio</th>
                <th className="p-2 text-center">Stock</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.map(p => (
                <tr
                  key={p.idProducto}
                  className="border-t hover:bg-accent/50 cursor-pointer"
                  onClick={() => onSelect({...p, precioUnitario: p.precioVentaVigente})}
                >
                  <td className="p-2 font-mono text-xs">{formatearNumeroProducto(p.idProducto)}</td>
                  <td className="p-2 font-medium">{p.descripcion}</td>
                  <td className="p-2 text-right">Gs. {formatNumberDots(p.precioVentaVigente)}</td>
                  <td className={`p-2 text-center ${p.cantidadTotal <= 0 ? 'text-red-500 font-bold' : ''}`}> {/*Cambiar a otro número */}
                    {p.cantidadTotal}
                  </td>
                  <td className="p-2 text-right">
                    <button className="text-primary hover:underline">Seleccionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProductos.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No se encontraron productos.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};