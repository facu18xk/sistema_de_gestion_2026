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

export function PageHeader({
    title,
    buttonLabel,
    onButtonClick,
    description,
    secondaryButtonLabel,
    onSecondaryButtonClick
}: PageHeaderProps) {
    return (
        <div className="flex justify-between items-center py-0">
            <div>
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
                {secondaryButtonLabel && onSecondaryButtonClick && (
                    <Button variant="outline" onClick={onSecondaryButtonClick} size="sm" className="h-8 cursor-pointer">
                        {secondaryButtonLabel}
                    </Button>
                )}
                {buttonLabel && onButtonClick && (
                    <Button onClick={onButtonClick} size="sm" className="h-8 gap-2 cursor-pointer">
                        <Plus className="size-4" /> {buttonLabel}
                    </Button>
                )}
            </div>
        </div>
    )
}
