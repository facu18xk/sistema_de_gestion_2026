import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    buttonLabel: string
    onButtonClick: () => void
}

export function PageHeader({ title, buttonLabel, onButtonClick }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <Button onClick={onButtonClick} className="gap-2 cursor-pointer">
                <Plus className="size-4" /> {buttonLabel}
            </Button>
        </div>
    )
}