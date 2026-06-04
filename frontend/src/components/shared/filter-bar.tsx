"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface FilterField {
    id: string
    label: string
    type: "text" | "select" | "date"
    placeholder?: string
    options?: { label: string; value: string }[]
}

interface FilterBarProps {
    fields: FilterField[]
    filters: Record<string, string>
    onFilterChange: (id: string, value: string) => void
}

<<<<<<< HEAD
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

=======
export function FilterBar({ fields, filters, onFilterChange }: FilterBarProps) {
>>>>>>> front
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 mb-5 border rounded-xl bg-card text-card-foreground shadow-sm w-full flex-wrap lg:flex-nowrap">
            {fields.map((field) => {
                const hasValue = !!filters[field.id]

                return (
                    <div
                        key={field.id}
                        className="flex items-center gap-2 flex-1 min-w-[180px] sm:min-w-[220px]"
                    >
                        <Label
                            htmlFor={`filter-${field.id}`}
                            className="text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0"
                        >
                            {field.label}:
                        </Label>

                        <div className="relative flex-1">
                            {field.type === "text" && (
                                <>
                                    <Search
                                        className={`absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none transition-opacity ${
                                            hasValue ? "opacity-0" : "opacity-100"
                                        }`}
                                    />
                                    <Input
                                        id={`filter-${field.id}`}
                                        type="text"
                                        placeholder={field.placeholder || "Buscar..."}
                                        value={filters[field.id] || ""}
                                        onChange={(event) => onFilterChange(field.id, event.target.value)}
                                        className={`h-8 w-full transition-all text-xs bg-background ${
                                            hasValue ? "pl-2" : "pl-8"
                                        }`}
                                    />
                                </>
                            )}

                            {field.type === "select" && (
                                <Select
                                    value={filters[field.id] || "ALL"}
                                    onValueChange={(value) => onFilterChange(field.id, value === "ALL" ? "" : value)}
                                >
                                    <SelectTrigger id={`filter-${field.id}`} className="h-8 w-full text-xs bg-background">
                                        <SelectValue placeholder={field.placeholder || "Todos"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {field.type === "date" && (
                                <Input
                                    id={`filter-${field.id}`}
                                    type="date"
                                    value={filters[field.id] || ""}
                                    onChange={(event) => onFilterChange(field.id, event.target.value)}
                                    className="h-8 w-full text-xs bg-background"
                                />
                            )}
                        </div>
                    </div>
<<<<<<< HEAD
                </div>
            </div>
            <DetalleProductoSheet
                open={sheetDetalleOpen}
                onOpenChange={setSheetDetalleOpen}
                productoDetalle={productoDetalle}
            />
        </>
    );
=======
                )
            })}
        </div>
    )
>>>>>>> front
}
