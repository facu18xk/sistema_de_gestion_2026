"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "date";
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface FilterBarProps {
  fields: FilterField[];
  filters: Record<string, string>;
  onFilterChange: (id: string, value: string) => void;
}

export function FilterBar({ fields, filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex w-full flex-col flex-wrap gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm md:flex-row md:items-center lg:flex-nowrap">
      {fields.map((field) => {
        const hasValue = !!filters[field.id];

        return (
          <div
            key={field.id}
            className="flex min-w-[180px] flex-1 items-center gap-2 sm:min-w-[220px]"
          >
            <Label
              htmlFor={`filter-${field.id}`}
              className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground"
            >
              {field.label}:
            </Label>

            <div className="relative flex-1">
              {field.type === "text" && (
                <>
                  <Search
                    className={`pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70 transition-opacity ${
                      hasValue ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <Input
                    id={`filter-${field.id}`}
                    type="text"
                    placeholder={field.placeholder || "Buscar..."}
                    value={filters[field.id] || ""}
                    onChange={(event) =>
                      onFilterChange(field.id, event.target.value)
                    }
                    className={`h-8 w-full bg-background text-xs transition-all ${
                      hasValue ? "pl-2" : "pl-8"
                    }`}
                  />
                </>
              )}

              {field.type === "select" && (
                <Select
                  value={filters[field.id] || "ALL"}
                  onValueChange={(value) =>
                    onFilterChange(field.id, value === "ALL" ? "" : value)
                  }
                >
                  <SelectTrigger
                    id={`filter-${field.id}`}
                    className="h-8 w-full bg-background text-xs"
                  >
                    <SelectValue placeholder={field.placeholder || "Todos"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                  onChange={(event) =>
                    onFilterChange(field.id, event.target.value)
                  }
                  className="h-8 w-full bg-background text-xs"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
