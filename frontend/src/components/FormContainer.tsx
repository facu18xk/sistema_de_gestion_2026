"use client"

import { Button } from "@/components/ui/button"

interface FormContainerProps {
    children: React.ReactNode
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    isEditing: boolean
    submitText?: { save: string; update: string }
}

export function FormContainer({
    children,
    onSubmit,
    onCancel,
    isEditing,
    submitText = { save: "Guardar", update: "Actualizar" }
}: FormContainerProps) {
    return (
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
            {children}

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                    Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                    {isEditing ? submitText.update : submitText.save}
                </Button>
            </div>
        </form>
    )
}