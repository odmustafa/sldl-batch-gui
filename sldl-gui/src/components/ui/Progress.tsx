interface ProgressProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

export function Progress({
  value,
  max = 100,
  className = '',
  showLabel = false,
  size = 'md',
  variant = 'default',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full overflow-hidden rounded-full bg-secondary ${sizeStyles[size]}`}
      >
        <div
          className={`h-full transition-all duration-300 ease-in-out rounded-full ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 text-xs text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

