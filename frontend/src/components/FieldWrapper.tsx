"use client"

import { Label } from "@/components/ui/label"

interface FieldWrapperProps {
    id: string
    label: string
    children: React.ReactNode
    className?: string
}

export function FieldWrapper({ id, label, children, className }: FieldWrapperProps) {
    return (
        <div className={`grid gap-2 ${className}`}>
            <Label htmlFor={id}>{label}</Label>
            {children}
        </div>
    )
}