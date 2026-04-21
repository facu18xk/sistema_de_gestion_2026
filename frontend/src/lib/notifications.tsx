import { toast } from 'sonner'
import React from 'react'

export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description ? (
        <span className="text-green-900/80 dark:text-green-100/80">
          {description}
        </span>
      ) : null,
      style: {
        '--normal-bg': 'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
        '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
        '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
      } as React.CSSProperties
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description ? (
        <span className="text-amber-900/80 dark:text-amber-100/80">
          {description}
        </span>
      ) : null,
      style: {
        '--normal-bg': 'color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))',
        '--normal-text': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
        '--normal-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))'
      } as React.CSSProperties
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description ? (
        <span className="text-red-900/90 dark:text-red-200/90 font-medium">
          {description}
        </span>
      ) : null,
      style: {
        '--normal-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--background))',
        '--normal-text': 'var(--destructive)',
        '--normal-border': 'var(--destructive)'
      } as React.CSSProperties
    })
  }
}