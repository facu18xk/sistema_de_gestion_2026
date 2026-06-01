import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    buttonLabel: string
    onButtonClick: () => void
}

export function PageHeader({ title, buttonLabel, onButtonClick }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-1">
            <h1 className="text-xxl font-bold tracking-tight">{title}</h1>
            <Button onClick={onButtonClick} size="sm" className="h-6 gap-2 cursor-pointer">
                <Plus className="size-4" /> {buttonLabel}
            </Button>
        </div>
    )
}