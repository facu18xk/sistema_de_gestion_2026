import {
    Table,
    TableBody,
    TableCaption,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps {
    caption: string
    children: React.ReactNode
    headerRow: React.ReactNode // Pasamos la fila de cabecera completa para controlar alineación
}

export function DataTable({ caption, headerRow, children }: DataTableProps) {
    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableCaption>{caption}</TableCaption>
                <TableHeader>
                    {headerRow}
                </TableHeader>
                <TableBody>
                    {children}
                </TableBody>
            </Table>
        </div>
    )
}