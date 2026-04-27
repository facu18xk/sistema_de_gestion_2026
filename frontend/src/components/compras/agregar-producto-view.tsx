"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { DetalleProductoSheet } from "@/components/compras/detalle-producto-sheet"

export interface ProductoSeleccionable {
  id: number
  descripcion: string
  marca: string
  categoria: string
  precio: number
  disponible: number
  imagen?: string
}

export interface ProductoSeleccionadoParaPedido {
  id: number
  descripcion: string
  categoria: string
  precio: number
  cantidad: number
}

interface ProductoConSeleccion extends ProductoSeleccionable {
  cantidadSeleccionada: number
  marcado: boolean
}

interface AgregarProductosViewProps {
  productos: ProductoSeleccionable[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onCancel: () => void
  onCargarProductos: (productos: ProductoSeleccionadoParaPedido[]) => void
  onNuevoProducto: () => void
}

export function AgregarProductosView({
  productos,
  currentPage,
  totalPages,
  onPageChange,
  onCancel,
  onCargarProductos,
  onNuevoProducto,
}: AgregarProductosViewProps) {
  const [productosEstado, setProductosEstado] = useState<ProductoConSeleccion[]>([])
  const [productoDetalle, setProductoDetalle] = useState<ProductoConSeleccion | null>(null)
  const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false)

  const [filtroNombre, setFiltroNombre] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("")
  const [filtroMarca, setFiltroMarca] = useState("")

  useEffect(() => {
    setProductosEstado(
      productos.map((p) => ({
        ...p,
        cantidadSeleccionada: 0,
        marcado: false,
      }))
    )
  }, [productos])

  const actualizarProducto = (id: number, cambios: Partial<ProductoConSeleccion>) => {
    setProductosEstado((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...cambios } : p))
    )
  }

  const productosFiltrados = productosEstado.filter((p) => {
    const coincideNombre = p.descripcion
      .toLowerCase()
      .includes(filtroNombre.toLowerCase())

    const coincideCategoria = p.categoria
      .toLowerCase()
      .includes(filtroCategoria.toLowerCase())

    const coincideMarca = p.marca
      .toLowerCase()
      .includes(filtroMarca.toLowerCase())

    return coincideNombre && coincideCategoria && coincideMarca
  })

  const cargarSeleccionados = () => {
    const seleccionados = productosEstado
      .filter((p) => p.marcado && p.cantidadSeleccionada > 0)
      .map((p) => ({
        id: p.id,
        descripcion: p.descripcion,
        categoria: p.categoria,
        precio: p.precio,
        cantidad: p.cantidadSeleccionada,
      }))

    onCargarProductos(seleccionados)
  }

  return (
    <>
      <div className="rounded-md border p-6 space-y-6">
        <PageHeader
          title="Agregar productos"
          buttonLabel="Nuevo Producto"
          onButtonClick={onNuevoProducto}
        />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">Buscar:</span>

            <Input
              placeholder="Nombre"
              className="max-w-[180px]"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />

            <Input
              placeholder="Categoría"
              className="max-w-[180px]"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            />

            <Input
              placeholder="Marca"
              className="max-w-[180px]"
              value={filtroMarca}
              onChange={(e) => setFiltroMarca(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Seleccionar</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.descripcion}</TableCell>
                    <TableCell>{p.marca}</TableCell>
                    <TableCell>{p.categoria}</TableCell>
                    <TableCell>{p.precio}</TableCell>

                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setProductoDetalle(p)
                          setSheetDetalleOpen(true)
                        }}
                      >
                        ≡
                      </Button>
                    </TableCell>

                    <TableCell>{p.disponible}</TableCell>

                    <TableCell>
                      <Input
                        className="w-20"
                        type="number"
                        min={0}
                        value={p.cantidadSeleccionada}
                        onChange={(e) =>
                          actualizarProducto(p.id, {
                            cantidadSeleccionada: Number(e.target.value),
                          })
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <input
                        type="checkbox"
                        checked={p.marcado}
                        onChange={(e) =>
                          actualizarProducto(p.id, {
                            marcado: e.target.checked,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-4">
            {/* IZQUIERDA: PAGINACIÓN */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button type="button" onClick={cargarSeleccionados}>
            Cargar productos
          </Button>
        </div>
      </div>
      </div>

      <DetalleProductoSheet
        open={sheetDetalleOpen}
        onOpenChange={setSheetDetalleOpen}
        productoDetalle={productoDetalle}
      />
    </>
  )
}