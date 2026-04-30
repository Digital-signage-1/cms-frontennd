'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Check, ExternalLink, Loader2, Search, X } from 'lucide-react'
import type { CredentialField, IntegrationProvider } from '@signage/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { GoogleOAuthButton } from './GoogleOAuthButton'
import { MicrosoftOAuthButton } from './MicrosoftOAuthButton'
import {
  useIntegrationCatalog,
  useConnectWithCredentials,
  useInitiateOAuth,
} from '@/hooks/queries/useIntegrations'

const CATEGORY_LABELS: Record<string, string> = {
  google: 'Google',
  analytics: 'Analytics',
  communication: 'Communication',
  crm: 'CRM',
  data: 'Data',
  social: 'Social',
}

import { ProviderIcon } from './ProviderIcon'

interface CredentialFormProps {
  provider: IntegrationProvider
  workspaceId: number | string
  onSuccess: () => void
  onBack: () => void
}

function CredentialForm({ provider, workspaceId, onSuccess, onBack }: CredentialFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const connect = useConnectWithCredentials()

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev }
      let changed = false
      for (const f of provider.credential_fields) {
        if (next[f.name] !== undefined && next[f.name] !== '') continue
        if (f.type === 'select' && f.options && f.options.length > 0) {
          next[f.name] = f.options[0].value
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [provider.provider])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    for (const field of provider.credential_fields) {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    connect.mutate(
      {
        workspaceId,
        data: {
          provider: provider.provider,
          credentials: values,
        },
      },
      { onSuccess }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <ProviderIcon provider={provider.provider} />
        <div>
          <h3 className="font-semibold text-text-primary">{provider.display_name}</h3>
          <p className="text-xs text-text-muted">{provider.description}</p>
        </div>
      </div>

      {provider.credential_fields.map((f: CredentialField) => (
        <div key={f.name} className="flex flex-col gap-1.5">
          <Label htmlFor={f.name} className="text-xs font-medium">
            {f.label}
            {f.required && <span className="text-red-400 ml-0.5">*</span>}
          </Label>
          {f.type === 'select' && f.options && f.options.length > 0 ? (
            <Select
              id={f.name}
              value={values[f.name] ?? f.options[0].value}
              onValueChange={(val) => {
                setValues((v) => ({ ...v, [f.name]: val }))
                if (errors[f.name]) setErrors((e) => ({ ...e, [f.name]: '' }))
              }}
              options={f.options.map((o) => ({ value: o.value, label: o.label }))}
              placeholder={f.placeholder || 'Select...'}
              error={!!errors[f.name]}
            />
          ) : f.type === 'textarea' ? (
            <Textarea
              id={f.name}
              placeholder={f.placeholder}
              value={values[f.name] ?? ''}
              onChange={(e) => {
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
                if (errors[f.name]) setErrors((e) => ({ ...e, [f.name]: '' }))
              }}
              className={`min-h-[120px] font-mono text-xs ${errors[f.name] ? 'border-red-500/50' : ''}`}
            />
          ) : (
            <Input
              id={f.name}
              type={f.type === 'password' ? 'password' : f.type === 'url' ? 'url' : 'text'}
              placeholder={f.placeholder}
              value={values[f.name] ?? ''}
              onChange={(e) => {
                setValues((v) => ({ ...v, [f.name]: e.target.value }))
                if (errors[f.name]) setErrors((e) => ({ ...e, [f.name]: '' }))
              }}
              className={errors[f.name] ? 'border-red-500/50' : ''}
            />
          )}
          {f.help_text && !errors[f.name] && (
            <p className="text-xs text-text-muted">{f.help_text}</p>
          )}
          {errors[f.name] && (
            <p className="text-xs text-red-400">{errors[f.name]}</p>
          )}
        </div>
      ))}

      {connect.isError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
          <p className="text-xs text-red-400">{(connect.error as Error)?.message}</p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back
        </Button>
        <Button type="submit" size="sm" className="flex-1" disabled={connect.isPending}>
          {connect.isPending ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Connecting...</>
          ) : (
            'Connect'
          )}
        </Button>
      </div>

      {provider.docs_url && (
        <a
          href={provider.docs_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-xs text-text-muted hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          View documentation
        </a>
      )}
    </form>
  )
}

interface OAuthConnectProps {
  provider: IntegrationProvider
  workspaceId: number | string
  onBack: () => void
}

function OAuthConnect({ provider, workspaceId, onBack }: OAuthConnectProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <ProviderIcon provider={provider.provider} />
      <div className="text-center">
        <h3 className="font-semibold text-text-primary">{provider.display_name}</h3>
        <p className="mt-1 text-xs text-text-muted max-w-xs">{provider.description}</p>
      </div>
      <div className="w-full rounded-lg border border-border bg-surface-alt/40 px-4 py-3">
        <p className="text-xs text-text-muted mb-2 font-medium">Required permissions:</p>
        <ul className="flex flex-col gap-1">
          {provider.scopes.filter(s => !s.startsWith('openid') && !s.startsWith('email') && !s.startsWith('profile')).map((scope) => (
            <li key={scope} className="flex items-center gap-1.5 text-xs text-text-muted">
              <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="truncate">{scope.split('/').pop()?.replace('.readonly', ' (read-only)') ?? scope}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-full flex flex-col gap-2">
        {provider.provider === 'powerbi' ? (
          <MicrosoftOAuthButton
            workspaceId={workspaceId}
            provider={provider.provider}
            label="Connect with Microsoft"
          />
        ) : (
          <GoogleOAuthButton workspaceId={workspaceId} provider={provider.provider} />
        )}
        <Button variant="ghost" size="sm" className="w-full text-text-muted" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back
        </Button>
      </div>
    </div>
  )
}

interface AddIntegrationModalProps {
  workspaceId: number | string
  onClose: () => void
  onSuccess?: () => void
}

export function AddIntegrationModal({
  workspaceId,
  onClose,
  onSuccess,
}: AddIntegrationModalProps) {
  const [step, setStep] = useState<'select' | 'connect'>('select')
  const [selected, setSelected] = useState<IntegrationProvider | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | undefined>(undefined)

  const { data, isLoading } = useIntegrationCatalog(category)

  const providers = (data?.providers ?? []).filter(
    (p) =>
      !search ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  )
  const categories = data?.categories ?? []

  const handleSelect = (provider: IntegrationProvider) => {
    setSelected(provider)
    setStep('connect')
  }

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
          <h2 className="font-semibold text-text-primary">
            {step === 'select' ? 'Add Integration' : `Connect ${selected?.display_name}`}
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' ? (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  placeholder="Search integrations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setCategory(undefined)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!category ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat === category ? undefined : cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${category === cat ? 'bg-primary text-white' : 'bg-surface-alt text-text-muted hover:text-text-primary'}`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-alt" />
                  ))}
                </div>
              ) : providers.length === 0 ? (
                <div className="py-10 text-center text-sm text-text-muted">
                  No integrations found
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {providers.map((provider) => (
                    <button
                      key={provider.provider}
                      onClick={() => handleSelect(provider)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-all hover:border-primary/40 hover:bg-surface-alt/40"
                    >
                      <ProviderIcon provider={provider.provider} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            {provider.display_name}
                          </span>
                          {provider.is_beta && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                              Beta
                            </span>
                          )}
                          <span className="ml-auto text-xs text-text-muted capitalize bg-surface-alt rounded px-2 py-0.5">
                            {provider.auth_flow === 'oauth2' ? 'OAuth' : provider.auth_flow.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                          {provider.description}
                        </p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-text-muted rotate-180 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : selected ? (
            selected.auth_flow === 'oauth2' ? (
              <OAuthConnect
                provider={selected}
                workspaceId={workspaceId}
                onBack={() => setStep('select')}
              />
            ) : (
              <CredentialForm
                key={selected.provider}
                provider={selected}
                workspaceId={workspaceId}
                onSuccess={handleSuccess}
                onBack={() => setStep('select')}
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
