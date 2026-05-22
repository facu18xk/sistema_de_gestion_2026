"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Menu, Search } from "lucide-react";
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
import { DetalleProductoSheet } from "@/components/compras/detalle-producto-sheet";

export interface ProductoSeleccionable {
  id: number;
  idCategoria: number;
  descripcion: string;
  marca: string;
  categoria: string;
  precio: number;
  disponible: number;
  imagen?: string;
}

export interface ProductoSeleccionadoParaPedido {
  id: number;
  descripcion: string;
  categoria: string;
  idCategoria: number;
  precio: number;
  cantidad: number;
}

interface ProductoConSeleccion extends ProductoSeleccionable {
  cantidadSeleccionada: number;
  marcado: boolean;
}

interface AgregarProductosModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: ProductoSeleccionable[];
  itemsExistentes: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCargarProductos: (productos: ProductoSeleccionadoParaPedido[]) => void;
  onNuevoProducto: () => void;
}

export function AgregarProductosModal({
  isOpen,
  onClose,
  productos,
  itemsExistentes,
  currentPage,
  totalPages,
  onPageChange,
  onCargarProductos,
  onNuevoProducto,
}: AgregarProductosModalProps) {
  const [productosEstado, setProductosEstado] = useState<ProductoConSeleccion[]>([]);
  const [productoDetalle, setProductoDetalle] = useState<ProductoConSeleccion | null>(null);
  const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false);

  // Memoria de seleccionados entre páginas
  const [memoriaSeleccionados, setMemoriaSeleccionados] = useState<Map<number, ProductoConSeleccion>>(new Map());

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [soloSeleccionados, setSoloSeleccionados] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const mapaInicial = new Map();
    itemsExistentes.forEach(item => {
      mapaInicial.set(item.idProducto, {
        id: item.idProducto,
        descripcion: item.descripcion,
        categoria: item.categoria,
        idCategoria: item.idCategoria,
        precio: item.precio || 0,
        marca: "",
        disponible: 0,
        cantidadSeleccionada: item.cantidad,
        marcado: true
      });
    });
    setMemoriaSeleccionados(mapaInicial);
  }, [isOpen, itemsExistentes]);

  useEffect(() => {
    setProductosEstado(
      productos.map((p) => {
        const guardado = memoriaSeleccionados.get(p.id);
        if (guardado) {
          return { ...p, ...guardado };
        }
        return {
          ...p,
          cantidadSeleccionada: 0,
          marcado: false,
        };
      })
    );
  }, [productos, memoriaSeleccionados]);

  const actualizarProducto = (id: number, cambios: Partial<ProductoConSeleccion>) => {
    setProductosEstado((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevoEstado = { ...p, ...cambios };

          if (cambios.marcado === true && nuevoEstado.cantidadSeleccionada === 0) {
            nuevoEstado.cantidadSeleccionada = 1;
          }
          if (cambios.marcado === false) {
            nuevoEstado.cantidadSeleccionada = 0;
          }
          if (cambios.cantidadSeleccionada !== undefined) {
            nuevoEstado.marcado = cambios.cantidadSeleccionada > 0;
          }

          setMemoriaSeleccionados(prevMem => {
            const nuevaMem = new Map(prevMem);
            if (nuevoEstado.marcado) {
              nuevaMem.set(id, nuevoEstado);
            } else {
              nuevaMem.delete(id);
            }
            return nuevaMem;
          });

          return nuevoEstado;
        }
        return p;
      })
    );
  };

  // FUNCIÓN DE FILTRADO REUTILIZABLE
  const cumpleFiltros = (p: ProductoConSeleccion) => {
    const coincideNombre = p.descripcion.toLowerCase().includes(filtroNombre.toLowerCase());
    const coincideCategoria = p.categoria.toLowerCase().includes(filtroCategoria.toLowerCase());
    const coincideMarca = (p.marca || "").toLowerCase().includes(filtroMarca.toLowerCase());
    return coincideNombre && coincideCategoria && coincideMarca;
  };

  // NUEVA LÓGICA DE CONSTRUCCIÓN DE LA TABLA (CON ORDENAMIENTO POR STOCK)
  const obtenerProductosRenderizados = () => {
    const todosLosSeleccionados = Array.from(memoriaSeleccionados.values());

    let resultado: ProductoConSeleccion[] = [];

    if (soloSeleccionados) {
      resultado = todosLosSeleccionados.filter(cumpleFiltros);
    } else {
      // 1. Siempre incluir TODOS los seleccionados que cumplan el filtro (independiente de la página)
      const seleccionadosVisibles = todosLosSeleccionados.filter(cumpleFiltros);

      // 2. Filtrar los productos de la página actual que cumplan con el filtro
      const paginaActualFiltrada = productosEstado.filter(cumpleFiltros);

      // 3. Unificar listas evitando duplicados (priorizando el estado de selección)
      const mapaUnificados = new Map<number, ProductoConSeleccion>();

      seleccionadosVisibles.forEach(p => mapaUnificados.set(p.id, p));
      paginaActualFiltrada.forEach(p => {
        if (!mapaUnificados.has(p.id)) {
          mapaUnificados.set(p.id, p);
        }
      });

      resultado = Array.from(mapaUnificados.values());
    }

    // Ordenar por cantidad en stock (disponible) de menor a mayor
    return resultado.sort((a, b) => a.disponible - b.disponible);
  };

  const productosVisibles = obtenerProductosRenderizados();

  const cargarSeleccionados = () => {
    const seleccionados = Array.from(memoriaSeleccionados.values())
      .map((p) => ({
        id: p.id,
        descripcion: p.descripcion,
        categoria: p.categoria,
        idCategoria: p.idCategoria,
        precio: p.precio,
        cantidad: p.cantidadSeleccionada,
      }));
    onCargarProductos(seleccionados);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="!w-[90vw] md:!w-[85vw] md:!max-w-5xl max-h-[92vh] flex flex-col p-5 overflow-hidden gap-0">

          {/* Header del Modal */}
          <DialogHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <DialogTitle className="text-lg font-bold tracking-tight">Agregar productos</DialogTitle>
            <Button
              type="button"
              onClick={onNuevoProducto}
              size="sm"
              className="h-8 gap-1.5 bg-zinc-700 text-white hover:bg-zinc-800 mr-6 text-xs"
            >
              <Plus className="size-3.5" />
              Nuevo Producto
            </Button>
          </DialogHeader>

          {/* Cuerpo */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">

            {/* Filtros horizontales compactos */}
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
                className="h-8 text-xs w-full sm:w-40 bg-background"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              />

              <Input
                placeholder="Filtrar marca..."
                className="h-8 text-xs w-full sm:w-40 bg-background"
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
              />

              {/* Texto "Seleccionados" */}
              <div className="flex items-center gap-2 bg-background border px-2.5 h-8 rounded-md shadow-sm w-full sm:w-auto justify-center">
                <input
                  type="checkbox"
                  id="soloSeleccionados"
                  className="size-3.5 accent-primary cursor-pointer rounded"
                  checked={soloSeleccionados}
                  onChange={(e) => setSoloSeleccionados(e.target.checked)}
                />
                <label htmlFor="soloSeleccionados" className="text-[11px] font-bold uppercase cursor-pointer select-none whitespace-nowrap">
                  Seleccionados ({memoriaSeleccionados.size})
                </label>
              </div>
            </div>

            {/* Tabla de Productos */}
            <div className="overflow-x-auto rounded-lg border shadow-sm bg-background">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="h-8">
                    <TableHead className="w-14 h-8 py-0.5 text-xs">ID</TableHead>
                    <TableHead className="h-8 py-0.5 text-xs w-[240px]">Descripción</TableHead>
                    <TableHead className="h-8 py-0.5 text-xs">Marca</TableHead>
                    <TableHead className="h-8 py-0.5 text-xs">Categoría</TableHead>
                    <TableHead className="w-24 h-8 py-0.5 text-xs">Precio</TableHead>
                    <TableHead className="w-14 text-center h-8 py-0.5 text-xs">Detalle</TableHead>
                    <TableHead className="w-16 text-center h-8 py-0.5 text-xs">Stock</TableHead>
                    <TableHead className="w-24 h-8 py-0.5 text-xs">Cantidad</TableHead>
                    <TableHead className="w-20 text-center h-8 py-0.5 text-xs">Seleccionar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosVisibles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8 text-xs">
                        No se encontraron productos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosVisibles.map((p) => {
                      const bajoStock = p.disponible < 20;

                      // Determinamos las clases de fondo dinámicamente
                      let rowClass = "hover:bg-muted/50";
                      if (p.marcado) {
                        rowClass = "bg-primary/10 hover:bg-primary/15 font-medium";
                      } else if (bajoStock) {
                        rowClass = "bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/30 transition-colors";
                      }

                      return (
                        <TableRow key={p.id} className={`h-9 transition-colors ${rowClass}`}>
                          <TableCell className="font-mono text-[11px] text-muted-foreground py-0.5">#{p.id}</TableCell>

                          <TableCell className="font-medium text-xs py-0.5 max-w-[240px] truncate" title={p.descripcion}>
                            {p.descripcion}
                          </TableCell>

                          <TableCell className="text-xs text-muted-foreground py-0.5">{p.marca || "—"}</TableCell>
                          <TableCell className="text-xs py-0.5">{p.categoria}</TableCell>
                          <TableCell className="font-semibold text-xs py-0.5">${p.precio}</TableCell>
                          <TableCell className="text-center py-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 rounded-md"
                              onClick={() => {
                                setProductoDetalle(p);
                                setSheetDetalleOpen(true);
                              }}
                            >
                              <Menu className="size-3" />
                            </Button>
                          </TableCell>
                          {/* Resaltamos también levemente el número de stock si está bajo */}
                          <TableCell className={`text-center font-medium text-xs py-0.5 ${bajoStock && !p.marcado ? "text-amber-700 dark:text-amber-400 font-bold" : ""}`}>
                            {p.disponible}
                          </TableCell>
                          <TableCell className="py-0.5">
                            <Input
                              className="w-20 h-6 text-center font-medium text-xs px-1"
                              type="number"
                              min={0}
                              placeholder="0"
                              value={p.cantidadSeleccionada === 0 ? "" : p.cantidadSeleccionada}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : Number(e.target.value);
                                actualizarProducto(p.id, { cantidadSeleccionada: val });
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-center py-0.5">
                            <input
                              type="checkbox"
                              className="size-3.5 accent-primary cursor-pointer"
                              checked={p.marcado}
                              onChange={(e) => actualizarProducto(p.id, { marcado: e.target.checked })}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
            <div className="flex items-center gap-2 bg-muted/60 px-2.5 py-1 rounded-lg border text-xs">
              <span className="font-medium text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-1 ml-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={currentPage === 1 || soloSeleccionados}
                  onClick={() => onPageChange(currentPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={currentPage === totalPages || soloSeleccionados}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="button" size="sm" className="h-8 text-xs shadow-sm" onClick={cargarSeleccionados}>
                Cargar seleccionados ({memoriaSeleccionados.size})
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      <DetalleProductoSheet
        open={sheetDetalleOpen}
        onOpenChange={setSheetDetalleOpen}
        productoDetalle={productoDetalle}
      />
    </>
  );
}