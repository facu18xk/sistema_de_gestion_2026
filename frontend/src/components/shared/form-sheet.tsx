"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName = "px-6 sm:max-w-[540px] sm:min-w-[450px]",
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
        <SheetHeader className="border-b pt-4">
          <SheetTitle>{title}</SheetTitle>

          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {children}
      </SheetContent>
    </Sheet>
  );
}
