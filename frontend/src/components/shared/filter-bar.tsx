"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Menu } from "lucide-react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { DetalleProductoSheet } from "@/components/compras/detalle-producto-sheet";

export interface ProductoSeleccionable {
    id: number;
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
    precio: number;
    cantidad: number;
}

export interface PedidoItem {
    id?: number | string;
    idProducto: number;
    cantidad: number;
    descripcion: string;
    categoria: string;
    precio?: number;
    esNuevo?: boolean;
}

interface ProductoConSeleccion extends ProductoSeleccionable {
    cantidadSeleccionada: number;
    marcado: boolean;
}

interface AgregarProductosViewProps {
    productos: ProductoSeleccionable[];
    itemsExistentes: PedidoItem[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onCancel: () => void;
    onCargarProductos: (productos: ProductoSeleccionadoParaPedido[]) => void;
    onNuevoProducto: () => void;
}

export type FilterField = {
    id: string;
    label: string;
    type: "text" | "select" | "date";
    placeholder?: string;
    options?: Array<{ label: string; value: string }>;
};

interface FilterBarProps {
    fields: FilterField[];
    filters: Record<string, string>;
    onFilterChange: (id: string, value: string) => void;
}

export function FilterBar({
    fields,
    filters,
    onFilterChange,
}: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-2">
            {fields.map((field) => (
                <div key={field.id} className="grid gap-1.5 min-w-[170px]">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {field.label}
                    </span>
                    {field.type === "select" ? (
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={filters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                        >
                            <option value="">{field.placeholder || "Todos"}</option>
                            {(field.options || []).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <Input
                            type={field.type}
                            className="h-9"
                            placeholder={field.placeholder}
                            value={filters[field.id] || ""}
                            onChange={(e) => onFilterChange(field.id, e.target.value)}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export function AgregarProductosView({
    productos,
    itemsExistentes,
    currentPage,
    totalPages,
    onPageChange,
    onCancel,
    onCargarProductos,
    onNuevoProducto,
}: AgregarProductosViewProps) {
    const [productosEstado, setProductosEstado] = useState<ProductoConSeleccion[]>([]);
    const [productoDetalle, setProductoDetalle] = useState<ProductoConSeleccion | null>(null);
    const [sheetDetalleOpen, setSheetDetalleOpen] = useState(false);

    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [soloSeleccionados, setSoloSeleccionados] = useState(false);

    useEffect(() => {
        // Sync derived view state when the incoming product list or existing items change.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProductosEstado(
            productos.map((p) => {
                const itemEnPedido = itemsExistentes.find((item) => item.idProducto === p.id);
                return {
                    ...p,
                    cantidadSeleccionada: itemEnPedido ? itemEnPedido.cantidad : 0,
                    marcado: !!itemEnPedido,
                };
            })
        );
    }, [productos, itemsExistentes]);

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
                    return nuevoEstado;
                }
                return p;
            })
        );
    };

    const productosVisibles = productosEstado.filter((p) => {
        if (soloSeleccionados && !p.marcado) return false;

        if (!soloSeleccionados && p.marcado) return true;

        const coincideNombre = p.descripcion.toLowerCase().includes(filtroNombre.toLowerCase());
        const coincideCategoria = p.categoria.toLowerCase().includes(filtroCategoria.toLowerCase());
        const coincideMarca = p.marca.toLowerCase().includes(filtroMarca.toLowerCase());

        return coincideNombre && coincideCategoria && coincideMarca;
    });

    const cargarSeleccionados = () => {
        const seleccionados = productosEstado
            .filter((p) => p.marcado && p.cantidadSeleccionada > 0)
            .map((p) => ({
                id: p.id,
                descripcion: p.descripcion,
                categoria: p.categoria,
                precio: p.precio,
                cantidad: p.cantidadSeleccionada,
            }));
        onCargarProductos(seleccionados);
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold tracking-tight">Agregar productos</h1>
                    <Button
                        type="button"
                        onClick={onNuevoProducto}
                        size="sm"
                        className="h-8 gap-2 bg-zinc-500 text-white hover:bg-zinc-600"
                    >
                        <Plus className="size-4" />
                        Nuevo Producto
                    </Button>
                </div>

                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-medium">Buscar:</span>
                        <Input
                            placeholder="Nombre"
                            className="max-w-[150px] h-8 text-xs"
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                        />
                        <Input
                            placeholder="Categoría"
                            className="max-w-[150px] h-8 text-xs"
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                        />
                        <Input
                            placeholder="Marca"
                            className="max-w-[150px] h-8 text-xs"
                            value={filtroMarca}
                            onChange={(e) => setFiltroMarca(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <input
                            type="checkbox"
                            id="soloSeleccionados"
                            className="size-4 accent-primary cursor-pointer"
                            checked={soloSeleccionados}
                            onChange={(e) => setSoloSeleccionados(e.target.checked)}
                        />
                        <label htmlFor="soloSeleccionados" className="text-xs font-medium cursor-pointer select-none">
                            Solo seleccionados
                        </label>
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
                            {productosVisibles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                                        No hay productos que coincidan con la búsqueda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                productosVisibles.map((p) => (
                                    <TableRow key={p.id} className={p.marcado ? "bg-muted/40" : ""}>
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
                                                    setProductoDetalle(p);
                                                    setSheetDetalleOpen(true);
                                                }}
                                            >
                                                <Menu className="size-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center">{p.disponible}</TableCell>
                                        <TableCell>
                                            <Input
                                                className="w-20 h-8"
                                                type="number"
                                                min={0}
                                                value={p.cantidadSeleccionada === 0 ? "" : p.cantidadSeleccionada}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                                                    actualizarProducto(p.id, { cantidadSeleccionada: val });
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                className="size-4 accent-primary cursor-pointer"
                                                checked={p.marcado}
                                                onChange={(e) => actualizarProducto(p.id, { marcado: e.target.checked })}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1 || soloSeleccionados}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Anterior
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || soloSeleccionados}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="button" size="sm" onClick={cargarSeleccionados}>
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
    );
}
