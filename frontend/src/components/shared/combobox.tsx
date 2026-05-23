"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export interface ComboboxProps<TItem> {
  value: string;
  items: TItem[];
  onChange: (value: string) => void;
  getItemValue: (item: TItem) => string;
  getItemSearchText: (item: TItem) => string;
  getItemDisplayValue?: (item: TItem) => string;
  renderItem?: (item: TItem, active: boolean) => ReactNode;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  recentLabel?: string;
  recentValues?: string[];
  onSelectRecent?: (value: string) => void;
  maxItems?: number;
  className?: string;
  inputClassName?: string;
}

export function Combobox<TItem>({
  value,
  items,
  onChange,
  getItemValue,
  getItemSearchText,
  getItemDisplayValue = getItemSearchText,
  renderItem,
  disabled,
  placeholder = "Buscar",
  emptyMessage = "Sin resultados",
  recentLabel = "Recientes",
  recentValues = [],
  onSelectRecent,
  maxItems = 8,
  className,
  inputClassName,
}: ComboboxProps<TItem>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });

  const selectedItem = useMemo(
    () => items.find((item) => getItemValue(item) === value),
    [getItemValue, items, value],
  );

  const updateMenuPosition = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPosition({
      left: rect.left,
      top: rect.bottom + 4,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;

    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);

    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open]);

  const recentItems = useMemo(() => {
    const itemByValue = new Map(items.map((item) => [getItemValue(item), item]));
    return recentValues
      .map((recentValue) => itemByValue.get(recentValue))
      .filter(Boolean) as TItem[];
  }, [getItemValue, items, recentValues]);

  const filteredItems = useMemo(() => {
    const term = normalizeSearch(query.trim());
    const source = term ? items : recentItems.length > 0 ? recentItems : items;

    return source
      .filter((item) => {
        if (!term) return true;
        return normalizeSearch(getItemSearchText(item)).includes(term);
      })
      .sort((a, b) => {
        if (!term) return 0;
        const aText = normalizeSearch(getItemSearchText(a));
        const bText = normalizeSearch(getItemSearchText(b));
        const aRank = aText.startsWith(term) ? 0 : 1;
        const bRank = bText.startsWith(term) ? 0 : 1;
        return (
          aRank - bRank || aText.localeCompare(bText, "es", { numeric: true })
        );
      })
      .slice(0, maxItems);
  }, [getItemSearchText, items, maxItems, query, recentItems]);

  const commitSelection = (item: TItem) => {
    const nextValue = getItemValue(item);
    onChange(nextValue);
    onSelectRecent?.(nextValue);
    setQuery(getItemSearchText(item));
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={
          open ? query : selectedItem ? getItemDisplayValue(selectedItem) : ""
        }
        onFocus={() => {
          updateMenuPosition();
          setOpen(true);
          setQuery(selectedItem ? getItemSearchText(selectedItem) : "");
          setActiveIndex(0);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(0);
          if (!event.target.value) onChange("");
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
            updateMenuPosition();
            setOpen(true);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              Math.min(current + 1, filteredItems.length - 1),
            );
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
          }
          if (event.key === "Enter" && filteredItems[activeIndex]) {
            event.preventDefault();
            commitSelection(filteredItems[activeIndex]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-7 rounded-md pl-7 text-sm focus-visible:ring-2",
          inputClassName,
        )}
      />
      {open && !disabled && (
        <div
          className="fixed z-[9999] max-h-72 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
          }}
        >
          {!query.trim() && recentItems.length > 0 && (
            <div className="px-2 py-1 text-[11px] font-medium uppercase text-muted-foreground">
              {recentLabel}
            </div>
          )}
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={getItemValue(item)}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commitSelection(item)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  {renderItem ? (
                    renderItem(item, active)
                  ) : (
                    <span className="truncate">
                      {getItemDisplayValue(item)}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-2 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
