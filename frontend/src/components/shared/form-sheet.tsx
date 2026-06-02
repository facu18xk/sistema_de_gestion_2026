"use client"

import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

interface FormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    contentClassName?: string
    side?: "top" | "right" | "bottom" | "left"
    showCloseButton?: boolean
}

export function FormSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    contentClassName = "sm:max-w-[540px] px-6",
    side = "right",
    showCloseButton = true,
}: FormSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                showCloseButton={showCloseButton}
                className={contentClassName}
            >
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    {description && (
                        <SheetDescription>{description}</SheetDescription>
                    )}
                </SheetHeader>

                <div className="mt-6">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}