"use client"

import { Input } from "@/components/ui/input"
import { PedidoItem } from "@/components/compras/pedido-form"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table"

interface PedidoItemsTableProps {
    items: PedidoItem[]
    onUpdateItem: (
        index: number,
        field: keyof PedidoItem,
        value: string | number
    ) => void
    totalGeneral: number
}

export function PedidoItemsTable({
    items,
    onUpdateItem,
    totalGeneral,
}: PedidoItemsTableProps) {
    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted">
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Último Precio</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Precio Total</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.cantidad}
                                    onChange={(e) =>
                                        onUpdateItem(index, "cantidad", Number(e.target.value))
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    value={item.descripcion}
                                    onChange={(e) =>
                                        onUpdateItem(index, "descripcion", e.target.value)
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    value={item.categoria}
                                    onChange={(e) =>
                                        onUpdateItem(index, "categoria", e.target.value)
                                    }
                                />
                            </TableCell>

                            <TableCell>
                                <Input
                                    type="number"
                                    value={item.ultimoPrecio}
                                    onChange={(e) =>
                                        onUpdateItem(index, "ultimoPrecio", Number(e.target.value))
                                    }
                                />
                            </TableCell>

                            <TableCell>{item.subtotal}</TableCell>

                            <TableCell>
                                <Input
                                    value={item.estado}
                                    onChange={(e) =>
                                        onUpdateItem(index, "estado", e.target.value)
                                    }
                                />
                            </TableCell>

                            <TableCell>{item.precioTotal}</TableCell>
                        </TableRow>
                    ))}

                    <TableRow className="font-semibold">
                        <TableCell colSpan={6} className="text-right">
                            Total
                        </TableCell>
                        <TableCell>{totalGeneral}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}