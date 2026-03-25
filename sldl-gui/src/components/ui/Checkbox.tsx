import React from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, onChange, className = '', id, disabled, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }
    
    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`
              h-5 w-5 shrink-0 rounded border border-input bg-background
              ring-offset-background transition-colors
              peer-focus-visible:outline-none peer-focus-visible:ring-2
              peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2
              peer-disabled:cursor-not-allowed peer-disabled:opacity-50
              peer-checked:bg-primary peer-checked:border-primary
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {checked && (
              <Check className="h-full w-full p-0.5 text-primary-foreground" strokeWidth={3} />
            )}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm font-medium leading-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

