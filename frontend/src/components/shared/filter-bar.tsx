"use client"

import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface FilterField {
    id: string
    label: string
    type: "text" | "select" | "date"
    placeholder?: string
    options?: { label: string; value: string }[]
}

interface FilterBarProps {
    fields: FilterField[]
    filters: Record<string, string>
    onFilterChange: (id: string, value: string) => void
}

export function FilterBar({ fields, filters, onFilterChange }: FilterBarProps) {
    return (
        // Cambiado a md:flex-row para que se ponga en horizontal mucho antes y flex-wrap por si la pantalla es excesivamente enana
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-3 mb-5 border rounded-xl bg-card text-card-foreground shadow-sm w-full flex-wrap lg:flex-nowrap">
            {fields.map((field) => {
                const hasValue = !!filters[field.id];

                return (
                    <div
                        key={field.id}
                        className="flex items-center gap-2 flex-1 min-w-[180px] sm:min-w-[220px]"
                    >
                        {/* Label compacto */}
                        <Label
                            htmlFor={`filter-${field.id}`}
                            className="text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0"
                        >
                            {field.label}:
                        </Label>

                        {/* Contenedor del Input */}
                        <div className="relative flex-1">
                            {field.type === "text" && (
                                <>
                                    <Search
                                        className={`absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none transition-opacity ${hasValue ? "opacity-0" : "opacity-100"
                                            }`}
                                    />
                                    <Input
                                        id={`filter-${field.id}`}
                                        type="text"
                                        placeholder={field.placeholder || "Buscar..."}
                                        value={filters[field.id] || ""}
                                        onChange={(e) => onFilterChange(field.id, e.target.value)}
                                        className={`h-8 w-full transition-all text-xs bg-background ${hasValue ? "pl-2" : "pl-8"
                                            }`}
                                    />
                                </>
                            )}

                            {field.type === "select" && (
                                <Select
                                    value={filters[field.id] || "ALL"}
                                    onValueChange={(value) => onFilterChange(field.id, value === "ALL" ? "" : value)}
                                >
                                    <SelectTrigger id={`filter-${field.id}`} className="h-8 w-full text-xs bg-background">
                                        <SelectValue placeholder={field.placeholder || "Todos"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todos</SelectItem>
                                        {field.options?.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {field.type === "date" && (
                                <Input
                                    id={`filter-${field.id}`}
                                    type="date"
                                    value={filters[field.id] || ""}
                                    onChange={(e) => onFilterChange(field.id, e.target.value)}
                                    className="h-8 w-full text-xs bg-background"
                                />
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}