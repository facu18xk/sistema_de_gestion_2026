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
    onCancel: () => void
    onCargarProductos: (productosSeleccionados: ProductoSeleccionadoParaPedido[]) => void
}

export function AgregarProductosView({
    productos,
    onCancel,
    onCargarProductos,
}: AgregarProductosViewProps) {
    const [productosEstado, setProductosEstado] = useState<ProductoConSeleccion[]>([])
    const [productoDetalle, setProductoDetalle] = useState<ProductoConSeleccion | null>(null)
    const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false)

    useEffect(() => {
        setProductosEstado(
            productos.map((p) => ({
                ...p,
                cantidadSeleccionada: 0,
                marcado: false,
            }))
        )
    }, [productos])

    const actualizarProducto = (
        id: number,
        cambios: Partial<ProductoConSeleccion>
    ) => {
        setProductosEstado((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...cambios } : p))
        )
    }

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
                <h2 className="text-2xl font-bold">Agregar productos</h2>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Lista Productos</h3>

                    <div className="flex items-center gap-3">
                        <span className="text-sm">Buscar:</span>
                        <Input placeholder="Nombre" className="max-w-[180px]" />
                        <Input placeholder="Categoría" className="max-w-[180px]" />
                        <Input placeholder="Marca" className="max-w-[180px]" />
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
                                <TableHead>Precio Costo Unit</TableHead>
                                <TableHead>Detalle</TableHead>
                                <TableHead>Disponibilidad</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Check</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {productosEstado.map((p) => (
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
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    actualizarProducto(p.id, {
                                                        cantidadSeleccionada: Math.max(0, p.cantidadSeleccionada - 1),
                                                    })
                                                }
                                            >
                                                -
                                            </Button>

                                            <Input
                                                className="w-16 text-center"
                                                type="number"
                                                value={p.cantidadSeleccionada}
                                                onChange={(e) =>
                                                    actualizarProducto(p.id, {
                                                        cantidadSeleccionada: Number(e.target.value),
                                                    })
                                                }
                                            />

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    actualizarProducto(p.id, {
                                                        cantidadSeleccionada: p.cantidadSeleccionada + 1,
                                                    })
                                                }
                                            >
                                                +
                                            </Button>
                                        </div>
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
                            ))}
                        </TableBody>
                    </Table>
                </div>


                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={cargarSeleccionados}>
                        Cargar productos
                    </Button>
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