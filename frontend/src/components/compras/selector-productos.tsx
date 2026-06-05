"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { productosAPI } from "@/services/productosAPI";
import { ProductoDTO } from "@/types/types";

interface ProductoConCantidad extends ProductoDTO {
  cantidadLocal?: number;
  marcado?: boolean;
}

export function SelectorProductos({
  onSelect,
}: {
  onSelect: (p: ProductoDTO & { cantidad: number }) => void;
}) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ProductoConCantidad[]>([]);
  const [soloSeleccionados, setSoloSeleccionados] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    try {
      const response = await productosAPI.getAll();
      const listaProductos = response?.items || [];
      const actualesMarcados = resultados.filter((r) => r.marcado);

      const filtrados = listaProductos
        .filter((p: ProductoDTO) =>
          p.descripcion.toLowerCase().includes(val.toLowerCase()),
        )
        .map((p: ProductoDTO) => {
          const existente = actualesMarcados.find(
            (m) => m.idProducto === p.idProducto,
          );
          return existente
            ? existente
            : { ...p, cantidadLocal: 0, marcado: false };
        });

      const resultadosFinales = [...actualesMarcados];
      filtrados.forEach((f) => {
        if (!resultadosFinales.find((r) => r.idProducto === f.idProducto)) {
          resultadosFinales.push(f);
        }
      });
      setResultados(resultadosFinales);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const actualizarLocal = (
    id: number,
    cambios: Partial<ProductoConCantidad>,
  ) => {
    setResultados((prev) =>
      prev.map((p) => {
        if (p.idProducto === id) {
          const nuevo = { ...p, ...cambios };
          if (cambios.marcado === true && (p.cantidadLocal || 0) === 0)
            nuevo.cantidadLocal = 1;
          if (cambios.cantidadLocal !== undefined)
            nuevo.marcado = cambios.cantidadLocal > 0;
          if (nuevo.marcado && (nuevo.cantidadLocal || 0) > 0)
            onSelect({ ...nuevo, cantidad: nuevo.cantidadLocal! });
          return nuevo;
        }
        return p;
      }),
    );
  };

  const resultadosVisibles = resultados.filter((p) => {
    if (soloSeleccionados && !p.marcado) return false;
    if (!soloSeleccionados && p.marcado) return true;
    return p.descripcion.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Search className="size-4 mr-2" /> Buscar y Agregar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Catálogo de Productos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Escribe para buscar..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg h-11 px-3">
              <input
                type="checkbox"
                id="checkSoloSel"
                className="size-4 accent-primary cursor-pointer"
                checked={soloSeleccionados}
                onChange={(e) => setSoloSeleccionados(e.target.checked)}
              />
              <label
                htmlFor="checkSoloSel"
                className="text-[10px] font-bold uppercase cursor-pointer select-none"
              >
                Ver Marcados
              </label>
            </div>
          </div>
          <div className="max-h-[350px] overflow-y-auto border rounded-xl divide-y">
            {resultadosVisibles.length > 0 ? (
              resultadosVisibles.map((p) => (
                <div
                  key={p.idProducto}
                  className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{p.descripcion}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={p.cantidadLocal === 0 ? "" : p.cantidadLocal}
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        actualizarLocal(p.idProducto, { cantidadLocal: val });
                      }}
                      className="w-16 h-8 text-center"
                    />
                    <input
                      type="checkbox"
                      className="size-4 accent-primary cursor-pointer"
                      checked={p.marcado || false}
                      onChange={(e) =>
                        actualizarLocal(p.idProducto, {
                          marcado: e.target.checked,
                        })
                      }
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-xs text-muted-foreground italic">
                No hay resultados disponibles.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
