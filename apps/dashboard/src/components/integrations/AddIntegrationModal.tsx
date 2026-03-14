'use client'

import { useState } from 'react'
import { ArrowLeft, Check, ExternalLink, Loader2, Search, X } from 'lucide-react'
import type { CredentialField, IntegrationProvider } from '@signage/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  data: 'Data',
  social: 'Social',
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google_sheets: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#0F9D58" />
      <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_drive: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <path d="M12 5l7 12H5L12 5z" fill="white" fillOpacity="0.9" />
      <path d="M5 17h14l-3-5H8L5 17z" fill="white" fillOpacity="0.5" />
    </svg>
  ),
  google_slides: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#F4B400" />
      <rect x="6" y="7" width="12" height="10" rx="1" stroke="white" strokeWidth="1.5" />
      <path d="M10 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_calendar: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <rect x="6" y="7" width="12" height="11" rx="1" stroke="white" strokeWidth="1.5" />
      <path d="M6 10h12" stroke="white" strokeWidth="1.5" />
      <path d="M9 5v4M15 5v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_docs: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <path d="M8 8h8M8 11h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_photos: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#EA4335" />
      <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="white" />
    </svg>
  ),
  google_forms: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#673AB7" />
      <circle cx="9" cy="9" r="1.5" fill="white" />
      <circle cx="9" cy="13" r="1.5" fill="white" />
      <path d="M13 9h4M13 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  google_maps: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#34A853" />
      <path d="M12 6c-2.21 0-4 1.79-4 4 0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" fill="white" />
      <circle cx="12" cy="10" r="1.5" fill="#34A853" />
    </svg>
  ),
  google_news: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <path d="M7 8h10M7 11h10M7 14h7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="14" r="2" fill="white" />
    </svg>
  ),
  looker_studio: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4285F4" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" fill="white" />
      <rect x="11" y="9" width="3" height="8" rx="0.5" fill="white" />
      <rect x="15" y="7" width="3" height="10" rx="0.5" fill="white" />
    </svg>
  ),
  powerbi: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#F2C811" />
      <rect x="7" y="12" width="3" height="6" rx="0.5" fill="white" />
      <rect x="11" y="8" width="3" height="10" rx="0.5" fill="white" />
      <rect x="15" y="5" width="3" height="13" rx="0.5" fill="white" />
    </svg>
  ),
  tableau: (
    <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white font-bold text-xs">TAB</div>
  ),
  slack: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4A154B" />
      <path d="M9 8.5a1.5 1.5 0 1 1-3 0v-1a1.5 1.5 0 0 1 3 0M14 8.5V7a1.5 1.5 0 0 1 3 0v1.5M14 15.5a1.5 1.5 0 0 1 3 0v1a1.5 1.5 0 0 1-3 0M9 15.5v1a1.5 1.5 0 0 1-3 0v-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

function ProviderIcon({ provider }: { provider: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt">
      {PROVIDER_ICONS[provider] ?? (
        <span className="text-base font-bold text-text-muted uppercase">
          {provider.slice(0, 2)}
        </span>
      )}
    </div>
  )
}

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
          <GoogleOAuthButton
            workspaceId={workspaceId}
            provider={provider.provider}
            label="Connect with Google"
          />
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
