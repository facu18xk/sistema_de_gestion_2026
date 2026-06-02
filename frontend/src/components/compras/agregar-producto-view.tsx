"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Menu, Search } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DetalleProductoSheet } from "@/components/compras/detalle-producto-sheet"

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
  const [productosEstado, setProductosEstado] = useState<ProductoConSeleccion[]>([])
  const [productoDetalle, setProductoDetalle] = useState<ProductoConSeleccion | null>(null)
  const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false)

  const [memoriaSeleccionados, setMemoriaSeleccionados] = useState<Map<number, ProductoConSeleccion>>(new Map())

  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroMarca, setFiltroMarca] = useState("")
  const [soloSeleccionados, setSoloSeleccionados] = useState(false)

  const [pageSeleccionados, setPageSeleccionados] = useState(1)

  const filasFijasObjetivo = 10

  useEffect(() => {
    setPageSeleccionados(1)
  }, [soloSeleccionados, filtroNombre, filtroCategoria, filtroMarca])

  useEffect(() => {
    if (!isOpen) return
    const mapaInicial = new Map()
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
      })
    })
    setMemoriaSeleccionados(mapaInicial)
  }, [isOpen, itemsExistentes])

  useEffect(() => {
    setProductosEstado(
      productos.map((p) => {
        const guardado = memoriaSeleccionados.get(p.id)
        if (guardado) {
          return { ...p, ...guardado }
        }
        return {
          ...p,
          cantidadSeleccionada: 0,
          marcado: false,
        }
      })
    )
  }, [productos, memoriaSeleccionados])

  const actualizarProducto = (id: number, cambios: Partial<ProductoConSeleccion>) => {
    setProductosEstado((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevoEstado = { ...p, ...cambios }

          if (cambios.marcado === true && nuevoEstado.cantidadSeleccionada === 0) {
            nuevoEstado.cantidadSeleccionada = 1
          }
          if (cambios.marcado === false) {
            nuevoEstado.cantidadSeleccionada = 0
          }
          if (cambios.cantidadSeleccionada !== undefined) {
            nuevoEstado.marcado = cambios.cantidadSeleccionada > 0
          }

          setMemoriaSeleccionados(prevMem => {
            const nuevaMem = new Map(prevMem)
            if (nuevoEstado.marcado) {
              nuevaMem.set(id, nuevoEstado)
            } else {
              nuevaMem.delete(id)
            }
            return nuevaMem
          })

          return nuevoEstado
        }
        return p
      })
    )
  }

  const cumpleFiltros = (p: ProductoConSeleccion) => {
    const coincideNombre = p.descripcion.toLowerCase().includes(filtroNombre.toLowerCase())
    const coincideCategoria = p.categoria.toLowerCase().includes(filtroCategoria.toLowerCase())
    const coincideMarca = (p.marca || "").toLowerCase().includes(filtroMarca.toLowerCase())
    return coincideNombre && coincideCategoria && coincideMarca
  }

  const obtenerProductosRenderizados = () => {
    if (soloSeleccionados) {
      const todosLosSeleccionados = Array.from(memoriaSeleccionados.values()).filter(cumpleFiltros)
      todosLosSeleccionados.sort((a, b) => a.disponible - b.disponible)

      const inicio = (pageSeleccionados - 1) * filasFijasObjetivo
      return todosLosSeleccionados.slice(inicio, inicio + filasFijasObjetivo)
    }

    return productosEstado.filter(cumpleFiltros).sort((a, b) => a.disponible - b.disponible)
  }

  const productosVisibles = obtenerProductosRenderizados()
  const filasVaciasRestantes = Math.max(0, filasFijasObjetivo - productosVisibles.length)

  const totalPagesSeleccionados = Math.ceil(
    Array.from(memoriaSeleccionados.values()).filter(cumpleFiltros).length / filasFijasObjetivo
  ) || 1

  const activeCurrentPage = soloSeleccionados ? pageSeleccionados : currentPage
  const activeTotalPages = soloSeleccionados ? totalPagesSeleccionados : totalPages

  const handlePageChangeInternal = (newPage: number) => {
    if (soloSeleccionados) {
      setPageSeleccionados(newPage)
    } else {
      onPageChange(newPage)
    }
  }

  const cargarSeleccionados = () => {
    const seleccionados = Array.from(memoriaSeleccionados.values())
      .map((p) => ({
        id: p.id,
        descripcion: p.descripcion,
        categoria: p.categoria,
        idCategoria: p.idCategoria,
        precio: p.precio,
        shadow: p.precio,
        cantidad: p.cantidadSeleccionada,
      }))
    onCargarProductos(seleccionados)
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="!w-[90vw] md:!w-[85vw] md:!max-w-5xl h-[92vh] max-h-[92vh] flex flex-col p-5 overflow-hidden gap-0">
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

          <div className="flex-1 flex flex-col min-h-0 space-y-2.5 py-1">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-muted/40 p-1.5 rounded-lg border shrink-0">
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

            {/* Contenedor con altura estrictamente bloqueada para evitar saltos visuales */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border shadow-sm bg-background">
              <Table className="table-fixed w-full">
                <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                  <TableRow className="h-9">
                    <TableHead className="w-14 h-9 text-xs">ID</TableHead>
                    <TableHead className="h-9 text-xs w-[240px]">Descripción</TableHead>
                    <TableHead className="h-9 text-xs">Marca</TableHead>
                    <TableHead className="h-9 text-xs">Categoría</TableHead>
                    <TableHead className="w-24 h-9 text-xs">Precio</TableHead>
                    <TableHead className="w-14 text-center h-9 text-xs">Detalle</TableHead>
                    <TableHead className="w-16 text-center h-9 text-xs">Stock</TableHead>
                    <TableHead className="w-24 h-9 text-xs">Cantidad</TableHead>
                    <TableHead className="w-20 text-center h-9 text-xs">Seleccionar</TableHead>
                  </TableRow>
                </TableHeader>
                {/* Forzamos al cuerpo a medir exactamente lo correspondiente a 10 filas de 44px */}
                <TableBody className="min-h-[440px] max-h-[440px]">
                  {productosVisibles.length === 0 ? (
                    <TableRow className="h-[440px] hover:bg-transparent">
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8 text-xs align-middle">
                        No se encontraron productos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {productosVisibles.map((p) => {
                        const bajoStock = p.disponible < 20
                        let rowClass = "hover:bg-muted/50"
                        if (p.marcado) {
                          rowClass = "bg-primary/10 hover:bg-primary/15 font-medium"
                        } else if (bajoStock) {
                          rowClass = "bg-amber-50/80 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/30 transition-colors"
                        }

                        return (
                          <TableRow key={p.id} className={`h-[44px] max-h-[44px] transition-colors ${rowClass}`}>
                            <TableCell className="font-mono text-[11px] text-muted-foreground py-1">#{p.id}</TableCell>
                            <TableCell className="font-medium text-xs py-1 max-w-[240px] truncate" title={p.descripcion}>
                              {p.descripcion}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground py-1 truncate">{p.marca || "—"}</TableCell>
                            <TableCell className="text-xs py-1 truncate">{p.categoria}</TableCell>
                            <TableCell className="font-semibold text-xs py-1">${p.precio}</TableCell>
                            <TableCell className="text-center py-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-6 rounded-md"
                                onClick={() => {
                                  setProductoDetalle(p)
                                  setSheetDetalleOpen(true)
                                }}
                              >
                                <Menu className="size-3" />
                              </Button>
                            </TableCell>
                            <TableCell className={`text-center font-medium text-xs py-1 ${bajoStock && !p.marcado ? "text-amber-700 dark:text-amber-400 font-bold" : ""}`}>
                              {p.disponible}
                            </TableCell>
                            <TableCell className="py-1">
                              <Input
                                className="w-20 h-6 text-center font-medium text-xs px-1"
                                type="number"
                                min={0}
                                placeholder="0"
                                value={p.cantidadSeleccionada === 0 ? "" : p.cantidadSeleccionada}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : Number(e.target.value)
                                  actualizarProducto(p.id, { cantidadSeleccionada: val })
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-center py-1">
                              <input
                                type="checkbox"
                                className="size-3.5 accent-primary cursor-pointer"
                                checked={p.marcado}
                                onChange={(e) => actualizarProducto(p.id, { marcado: e.target.checked })}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {filasVaciasRestantes > 0 &&
                        Array.from({ length: filasVaciasRestantes }).map((_, index) => (
                          <TableRow key={`empty-${index}`} className="h-[44px] max-h-[44px] border-transparent hover:bg-transparent">
                            <TableCell colSpan={9} className="py-1">&nbsp;</TableCell>
                          </TableRow>
                        ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2 shrink-0">
            <div className="flex items-center gap-2 bg-muted/60 px-2.5 py-1 rounded-lg border text-xs">
              <span className="font-medium text-muted-foreground">
                Página {activeCurrentPage} de {activeTotalPages}
              </span>
              <div className="flex gap-1 ml-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={activeCurrentPage === 1}
                  onClick={() => handlePageChangeInternal(activeCurrentPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  disabled={activeCurrentPage === activeTotalPages}
                  onClick={() => handlePageChangeInternal(activeCurrentPage + 1)}
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
  )
}