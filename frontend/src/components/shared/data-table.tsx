import {
    Table,
    TableBody,
    TableCaption,
    TableHeader,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTableProps {
    caption: string
    children: React.ReactNode
    headerRow: React.ReactNode
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function DataTable({
    caption,
    headerRow,
    children,
    currentPage,
    totalPages,
    onPageChange
}: DataTableProps) {
    return (
        <div className="space-y-3">
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    {/*<TableCaption>{caption}</TableCaption>*/}
                    <TableHeader>
                        {headerRow}
                    </TableHeader>
                    <TableBody>
                        {children}
                    </TableBody>
                </Table>
            </div>
            {/* CONTROLES DE PAGINACIÓN */}
            <div className="flex items-center justify-between px-2 py-1">
                <div className="text-sm text-muted-foreground">
                    Página <span className="font-medium text-foreground">{currentPage}</span> de{" "}
                    <span className="font-medium text-foreground">{totalPages || 1}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="cursor-pointer select-none"
                    >
                        <ChevronLeft className="size-4 mr-1" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="cursor-pointer select-none"
                    >
                        Siguiente
                        <ChevronRight className="size-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}