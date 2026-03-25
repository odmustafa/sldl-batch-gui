import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="drag-region flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div className="no-drag">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="no-drag flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

