import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    buttonLabel: string
    onButtonClick: () => void
}

export function PageHeader({ title, buttonLabel, onButtonClick }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center py-0">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <Button onClick={onButtonClick} size="sm" className="h-8 gap-2 cursor-pointer">
                <Plus className="size-4" /> {buttonLabel}
            </Button>
        </div>
    )
}