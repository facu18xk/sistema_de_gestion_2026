"use client"

import { Input } from "@/components/ui/input"
import { FieldWrapper } from "@/components/FieldWrapper"
import { FormSheet } from "@/components/shared/form-sheet"

interface ProductoDetalle {
    id: number
    descripcion: string
    marca: string
    categoria: string
    precio: number
    disponible: number
    imagen?: string
}

interface DetalleProductoSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    productoDetalle: ProductoDetalle | null
}

export function DetalleProductoSheet({
    open,
    onOpenChange,
    productoDetalle,
}: DetalleProductoSheetProps) {
    if (!productoDetalle) return null

    return (
        <FormSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Detalle producto"
            description="Información detallada del producto seleccionado."
            contentClassName="px-6 sm:max-w-[420px] overflow-y-auto"
        >
            <div className="grid gap-4 py-4 max-h-[calc(100vh-120px)] pr-2">
                <div className="border rounded-md h-40 flex items-center justify-center">
                    {productoDetalle.imagen ? (
                        <img
                            src={productoDetalle.imagen}
                            alt={productoDetalle.descripcion}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-sm text-muted-foreground">Imagen</span>
                    )}
                </div>

                <FieldWrapper id="detalle-id" label="ID">
                    <Input id="detalle-id" value={productoDetalle.id} readOnly />
                </FieldWrapper>

                <FieldWrapper id="detalle-descripcion" label="Descripción">
                    <Input
                        id="detalle-descripcion"
                        value={productoDetalle.descripcion}
                        readOnly
                    />
                </FieldWrapper>

                <FieldWrapper id="detalle-marca" label="Marca">
                    <Input
                        id="detalle-marca"
                        value={productoDetalle.marca}
                        readOnly
                    />
                </FieldWrapper>

                <FieldWrapper id="detalle-categoria" label="Categoría">
                    <Input
                        id="detalle-categoria"
                        value={productoDetalle.categoria}
                        readOnly
                    />
                </FieldWrapper>

                <FieldWrapper id="detalle-precio" label="Precio">
                    <Input
                        id="detalle-precio"
                        value={`Gs. ${productoDetalle.precio.toLocaleString()}`}
                        readOnly
                    />
                </FieldWrapper>

                <FieldWrapper id="detalle-disponible" label="Disponible">
                    <Input
                        id="detalle-disponible"
                        value={productoDetalle.disponible}
                        readOnly
                    />
                </FieldWrapper>
            </div>
        </FormSheet>
    )
}