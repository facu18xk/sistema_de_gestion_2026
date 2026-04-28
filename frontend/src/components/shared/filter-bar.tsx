// components/shared/filter-bar.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface FilterBarProps {
    children: ReactNode;
    onClear: () => void;
    hasFilters: boolean;
}

export function FilterBar({ children, onClear, hasFilters }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3 p-4 bg-slate-50/50 border rounded-lg mb-6">
            <div className="flex-1 flex flex-wrap gap-3">
                {children}
            </div>
            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-muted-foreground hover:text-destructive"
                >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                </Button>
            )}
        </div>
    );
}