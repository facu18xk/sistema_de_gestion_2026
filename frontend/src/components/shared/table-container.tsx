import { Table, TableCaption } from "@/components/ui/table"

interface TableContainerProps {
    caption: string
    children: React.ReactNode
}

export function TableContainer({ caption, children }: TableContainerProps) {
    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableCaption>{caption}</TableCaption>
                {children}
            </Table>
        </div>
    )
}