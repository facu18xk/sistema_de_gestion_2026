"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { productosAPI } from "@/services/productosAPI"
import { ProductoDTO } from "@/types/types"

// Extendemos el tipo localmente para manejar la UI del selector
interface ProductoConCantidad extends ProductoDTO {
    cantidadLocal?: number;
    marcado?: boolean;
}

export function SelectorProductos({ onSelect }: { onSelect: (p: ProductoDTO & { cantidad: number }) => void }) {
    const [query, setQuery] = useState("")
    const [resultados, setResultados] = useState<ProductoConCantidad[]>([])

    const handleSearch = async (val: string) => {
        setQuery(val)

        if (val.length < 1) {
            setResultados([])
            return
        }

        try {
            // Llamamos a la API
            const response = await productosAPI.getAll()

            // IMPORTANTE: Accedemos a response.items (o response.data según tu DTO)
            // He añadido una validación por si la respuesta viene vacía o nula
            const listaProductos = response?.items || []

            const filtrados = listaProductos
                .filter((p: ProductoDTO) =>
                    p.descripcion.toLowerCase().includes(val.toLowerCase())
                )
                .map((p: ProductoDTO) => ({
                    ...p,
                    cantidadLocal: 0,
                    marcado: false
                }))

            setResultados(filtrados)
        } catch (error) {
            console.error("Error cargando productos:", error)
            setResultados([])
        }
    }

    const actualizarLocal = (id: number, cambios: Partial<ProductoConCantidad>) => {
        setResultados(prev => prev.map(p => {
            if (p.idProducto === id) {
                const nuevo = { ...p, ...cambios };

                // Sincronización: Si marca el check sin cantidad, poner 1
                if (cambios.marcado === true && (p.cantidadLocal || 0) === 0) {
                    nuevo.cantidadLocal = 1;
                }
                // Si pone cantidad > 0, marcar check
                if (cambios.cantidadLocal !== undefined) {
                    nuevo.marcado = cambios.cantidadLocal > 0;
                }

                // Si está marcado y tiene cantidad, enviamos al componente padre
                if (nuevo.marcado && (nuevo.cantidadLocal || 0) > 0) {
                    onSelect({ ...nuevo, cantidad: nuevo.cantidadLocal! });
                }

                return nuevo;
            }
            return p;
        }));
    }

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
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Escribe para buscar..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                    <div className="max-h-[350px] overflow-y-auto border rounded-xl divide-y">
                        {resultados.length > 0 ? resultados.map((p) => (
                            <div key={p.idProducto} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">{p.descripcion}</span>
                                    <span className="text-xs text-muted-foreground">{p.categoria}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        // FIX: Evita el 0 molesto al escribir
                                        value={p.cantidadLocal === 0 ? "" : p.cantidadLocal}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                                            actualizarLocal(p.idProducto, { cantidadLocal: val });
                                        }}
                                        className="w-16 h-8 text-center"
                                    />

                                    <input
                                        type="checkbox"
                                        className="size-4 accent-primary cursor-pointer"
                                        checked={p.marcado || false}
                                        onChange={(e) => {
                                            actualizarLocal(p.idProducto, { marcado: e.target.checked });
                                        }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <p className="p-8 text-center text-xs text-muted-foreground italic">
                                {query.length > 0 ? "No hay resultados..." : "Empieza a escribir para buscar"}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}