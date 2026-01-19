'use client'

import { Input, Label } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

interface ValidationRule {
  min?: number
  max?: number
  step?: number
  accept?: string[]
  options?: Array<{ value: string; label: string; description?: string }>
  [key: string]: any
}

interface FormField {
  name: string
  label: string
  type: string
  required?: boolean
  description?: string
  placeholder?: string
  default_value?: any
  validation?: ValidationRule
}

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
  onContentSelect?: (contentId: string) => void
}

export function FormFieldRenderer({ 
  field, 
  value, 
  onChange, 
  error,
  onContentSelect 
}: FormFieldRendererProps) {
  const fieldValue = value !== undefined && value !== null ? value : (field.default_value ?? '')

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'url':
      case 'email':
        return (
          <Input
            id={field.name}
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-error' : ''}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 bg-surface border rounded-lg focus:outline-none focus:border-primary resize-none min-h-[100px] ${
              error ? 'border-error' : 'border-border'
            }`}
          />
        )

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={fieldValue}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step || 1}
            className={error ? 'border-error' : ''}
          />
        )

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={fieldValue ?? false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-2"
            />
            <span className="text-sm text-text-secondary">
              {field.description || field.label}
            </span>
          </label>
        )

      case 'select':
        const options = field.validation?.options || []
        return (
          <select
            id={field.name}
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 bg-surface border rounded-lg focus:outline-none focus:border-primary ${
              error ? 'border-error' : 'border-border'
            }`}
          >
            <option value="">Select {field.label}...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={fieldValue || 'var(--color-text-primary)'}
              onChange={(e) => onChange(e.target.value)}
              className="w-16 h-10 rounded border border-border cursor-pointer"
            />
            <Input
              type="text"
              value={fieldValue || 'var(--color-text-primary)'}
              onChange={(e) => onChange(e.target.value)}
              placeholder="var(--color-text-primary)"
              className="flex-1"
            />
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={fieldValue}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              step={field.validation?.step || 1}
              className="w-full h-2 bg-surface-alt rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>{field.validation?.min || 0}</span>
              <span className="text-text-primary font-medium">{fieldValue}</span>
              <span>{field.validation?.max || 100}</span>
            </div>
          </div>
        )

      case 'date':
        return (
          <Input
            id={field.name}
            type="date"
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-error' : ''}
          />
        )

      case 'time':
        return (
          <Input
            id={field.name}
            type="time"
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-error' : ''}
          />
        )

      case 'file_upload':
        return (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onContentSelect?.(field.name)}
              className={`w-full px-4 py-3 border-2 border-dashed rounded-lg hover:border-primary transition-colors text-left ${
                error ? 'border-error' : 'border-border'
              }`}
            >
              {fieldValue ? (
                <div>
                  <p className="text-sm font-medium text-text-primary">Selected: {fieldValue}</p>
                  <p className="text-xs text-text-muted mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-text-primary">Select Content</p>
                  <p className="text-xs text-text-muted mt-1">
                    {field.description || 'Click to choose from library'}
                  </p>
                </div>
              )}
            </button>
          </div>
        )

      case 'multi_select':
        const multiOptions = field.validation?.options || []
        const selectedValues = Array.isArray(fieldValue) ? fieldValue : []
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-surface">
            {multiOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, opt.value])
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== opt.value))
                    }
                  }}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">{opt.label}</span>
              </label>
            ))}
          </div>
        )

      default:
        return (
          <Input
            id={field.name}
            type="text"
            value={fieldValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-error' : ''}
          />
        )
    }
  }

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderField()}
        {error && (
          <div className="flex items-center gap-1 text-error text-sm">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium text-text-primary">
        {field.label} {field.required && <span className="text-error">*</span>}
      </Label>
      {renderField()}
      {field.description && field.type !== 'checkbox' && (
        <p className="text-xs text-text-muted">{field.description}</p>
      )}
      {error && (
        <div className="flex items-center gap-1 text-error text-sm">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
