'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInitiateOAuth } from '@/hooks/queries/useIntegrations'

interface MicrosoftOAuthButtonProps {
  workspaceId: number | string
  provider: string
  label?: string
  redirectUri?: string
  disabled?: boolean
  variant?: 'default' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

export function MicrosoftOAuthButton({
  workspaceId,
  provider,
  label,
  redirectUri,
  disabled,
  variant = 'default',
  size = 'default',
}: MicrosoftOAuthButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const initOAuth = useInitiateOAuth()

  const defaultRedirectUri =
    redirectUri ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/integrations/microsoft/callback`
      : '')

  const handleClick = () => {
    setIsRedirecting(true)
    initOAuth.mutate(
      { workspaceId, provider, redirectUri: defaultRedirectUri },
      {
        onError: () => setIsRedirecting(false),
      }
    )
  }

  const isPending = initOAuth.isPending || isRedirecting

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 21 21" fill="none">
          <rect x="1" y="1" width="9" height="9" fill="#F25022" />
          <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
          <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
      )}
      {label || 'Sign in with Microsoft'}
    </Button>
  )
}
