'use client'

import { useState, useMemo } from 'react'
import { Input, Label } from '@/components/ui'
import { AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react'
import { GoogleResourcePicker } from '@/components/integrations/GoogleResourcePicker'
import { GoogleOAuthButton } from '@/components/integrations/GoogleOAuthButton'
import { useIntegrations } from '@/hooks/queries/useIntegrations'

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
  provider?: string
  resource_type?: string
  allow_manual?: boolean
  [key: string]: any
}

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
  onContentSelect?: (contentId: string) => void
  formData?: Record<string, any>
  workspaceId?: string | number
}

export function FormFieldRenderer({
  field,
  value,
  onChange,
  error,
  onContentSelect,
  formData,
  workspaceId,
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
            type={field.type === 'email' ? 'email' : 'text'}
            value={fieldValue}
            onChange={(e) => {
              let val = e.target.value
              // If user pastes an <iframe> or embed code, extract the src URL
              if (field.type === 'url' && val.includes('<iframe')) {
                const srcMatch = val.match(/src=["']([^"']+)["']/)
                if (srcMatch) val = srcMatch[1]
              }
              onChange(val)
            }}
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

      case 'integration_selector':
        return (
          <IntegrationSelectorField
            provider={field.provider || ''}
            workspaceId={workspaceId}
            value={fieldValue}
            onChange={onChange}
            error={error}
          />
        )

      case 'resource_picker':
        return (
          <ResourcePickerField
            field={field}
            value={fieldValue}
            onChange={onChange}
            integrationId={formData?.integration_id}
            workspaceId={workspaceId}
            error={error}
          />
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


// --- Sub-components for integration fields ---

function IntegrationSelectorField({
  provider,
  workspaceId,
  value,
  onChange,
  error,
}: {
  provider: string
  workspaceId?: string | number
  value: any
  onChange: (value: any) => void
  error?: string
}) {
  // For Google app types, look for the single "google" integration.
  const isGoogle = provider.startsWith('google')
  const queryProvider = isGoogle ? undefined : provider
  const { data, isLoading } = useIntegrations(workspaceId ?? '', queryProvider)

  const allIntegrations = data?.integrations ?? (Array.isArray(data) ? data : [])
  const integrations = allIntegrations.filter((i: any) => {
    if (i.status !== 'active') return false
    if (isGoogle) return i.provider === 'google' || i.provider?.startsWith('google_')
    return true
  })

  // Deduplicate by display_name (one entry per Google account)
  const displayOptions = useMemo(() => {
    const seen = new Map<string, { id: string; label: string }>()
    for (const i of integrations) {
      const key = i.display_name || i.provider
      if (!seen.has(key)) {
        seen.set(key, { id: i.integration_id || i.id, label: key })
      }
    }
    return Array.from(seen.values())
  }, [integrations])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
        <span className="text-sm text-text-muted">Loading accounts...</span>
      </div>
    )
  }

  if (displayOptions.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4 text-center">
        <p className="text-sm text-text-muted">
          No Google account connected. Connect one first from the Integrations page.
        </p>
        {workspaceId && (
          <GoogleOAuthButton
            workspaceId={workspaceId}
            provider={isGoogle ? 'google_sheets' : provider}
            size="sm"
          />
        )}
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 bg-surface border rounded-lg focus:outline-none focus:border-primary ${
        error ? 'border-error' : 'border-border'
      }`}
    >
      <option value="">Select a Google account...</option>
      {displayOptions.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function ResourcePickerField({
  field,
  value,
  onChange,
  integrationId,
  workspaceId,
  error,
}: {
  field: FormField
  value: any
  onChange: (value: any) => void
  integrationId?: string | number
  workspaceId?: string | number
  error?: string
}) {
  const [manualMode, setManualMode] = useState(false)

  if (!integrationId) {
    return (
      <div className="rounded-lg border border-border bg-surface-alt/30 px-3 py-3">
        <p className="text-sm text-text-muted">Select a Google account first</p>
      </div>
    )
  }

  if (manualMode) {
    return (
      <div className="space-y-2">
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label} ID or URL`}
          className={error ? 'border-error' : ''}
        />
        <button
          type="button"
          onClick={() => setManualMode(false)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Browse resources instead
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <GoogleResourcePicker
        workspaceId={workspaceId ?? ''}
        provider={field.provider || ''}
        integrationId={integrationId}
        resourceType={field.resource_type || 'file'}
        onSelect={(resourceId) => onChange(resourceId)}
        selectedId={value}
      />
      {field.allow_manual && (
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          Enter ID manually
        </button>
      )}
    </div>
  )
}
