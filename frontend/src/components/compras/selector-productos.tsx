"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { productosAPI } from "@/services/productosAPI"
import { ProductoDTO } from "@/types/types"

export function SelectorProductos({ onSelect }: { onSelect: (p: ProductoDTO) => void }) {
    const [query, setQuery] = useState("")
    const [resultados, setResultados] = useState<ProductoDTO[]>([])

    const handleSearch = async (val: string) => {
        setQuery(val)

        if (val.length < 1) {
            setResultados([])
            return
        }

        try {
            const all = await productosAPI.getAll()

            const filtrados = all.filter(p =>
                p.descripcion.toLowerCase().includes(val.toLowerCase())
            )

            setResultados(filtrados)
        } catch (error) {
            console.error("Error cargando productos:", error)
            setResultados([])
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Search className="size-4 mr-2" /> Buscar y Agregar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Catálogo de Productos</DialogTitle></DialogHeader>
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
                    <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y">
                        {resultados.length > 0 ? resultados.map((p) => (
                            // dentro del map
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) onSelect(p)
                                    }}
                                />

                                <Input
                                    type="number"
                                    disabled
                                    className="w-16 h-8"
                                />
                            </div>
                        )) : <p className="p-8 text-center text-xs text-muted-foreground italic">No hay resultados...</p>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}