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
}

export function PedidoItemsTable({ items, onUpdateItem }: PedidoItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Cantidad</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Último Precio</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No hay productos agregados.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}