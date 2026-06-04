import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    buttonLabel?: string
    onButtonClick?: () => void
    description?: string
    secondaryButtonLabel?: string
    onSecondaryButtonClick?: () => void
}

export function PageHeader({ title, buttonLabel, onButtonClick, description, secondaryButtonLabel, onSecondaryButtonClick }: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center mb-1">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
                {secondaryButtonLabel && onSecondaryButtonClick && (
                    <Button variant="outline" onClick={onSecondaryButtonClick} size="sm" className="h-6 cursor-pointer">
                        {secondaryButtonLabel}
                    </Button>
                )}
                {buttonLabel && onButtonClick && (
                    <Button onClick={onButtonClick} size="sm" className="h-6 gap-2 cursor-pointer">
                        <Plus className="size-4" /> {buttonLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}