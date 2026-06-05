import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface PathStep {
  label: string
  href?: string
}

export function PageBreadcrumb({ steps }: { steps: PathStep[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dsahboard">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {step.href ? (
                <BreadcrumbLink href={step.href}>{step.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{step.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
import React from "react"
