"use client"

import { Button } from "@/components/ui/button"

interface FormContainerProps {
    children: React.ReactNode
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    isEditing: boolean
    submitText?: { save: string; update: string }
    submitDisabled?: boolean // <-- Agregado: para controlar el estado de carga
}

export function FormContainer({
    children,
    onSubmit,
    onCancel,
    isEditing,
    submitText = { save: "Guardar", update: "Actualizar" },
    submitDisabled = false // <-- Agregado con valor por defecto
}: FormContainerProps) {
    return (
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
            {children}

            <div className="flex justify-end gap-3 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="cursor-pointer"
                    disabled={submitDisabled} // Opcional: desactiva cancelar mientras guarda
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={submitDisabled} // <-- Agregado: bloquea el botón al hacer clic
                >
                    {isEditing ? submitText.update : submitText.save}
                </Button>
            </div>
        </form>
    )
}