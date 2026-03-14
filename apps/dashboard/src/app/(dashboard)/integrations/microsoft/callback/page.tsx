'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useOAuthCallback } from '@/hooks/queries/useIntegrations'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'

type State = 'loading' | 'success' | 'error'

export default function MicrosoftOAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const hasRun = useRef(false)

  const workspace = useAuthStore((s) => s.workspace)
  const workspaces = useAuthStore((s) => s.workspaces)
  const workspaceId =
    workspace?.id ||
    (workspace as any)?.workspace_id ||
    workspaces?.[0]?.id ||
    (workspaces?.[0] as any)?.workspace_id ||
    0

  const oauthCallback = useOAuthCallback()

  useEffect(() => {
    if (!workspaceId || hasRun.current) return
    hasRun.current = true

    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')
    const provider = searchParams.get('provider') ?? 'powerbi'

    if (error) {
      setState('error')
      setErrorMsg(error === 'access_denied' ? 'Access was denied.' : `OAuth error: ${error}`)
      return
    }

    if (!code || !stateParam) {
      setState('error')
      setErrorMsg('Missing authorization code or state. Please try again.')
      return
    }

    const redirectUri = `${window.location.origin}/integrations/microsoft/callback`

    oauthCallback.mutate(
      { workspaceId, provider, code, state: stateParam, redirectUri },
      {
        onSuccess: () => setState('success'),
        onError: (err: Error) => {
          setState('error')
          setErrorMsg(err.message || 'Failed to complete authorization.')
        },
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-xl">
        {state === 'loading' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Connecting...</h2>
            <p className="mt-2 text-sm text-text-muted">
              Completing authorization with Microsoft. This will only take a moment.
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Connected!</h2>
            <p className="mt-2 text-sm text-text-muted">
              Your Microsoft account has been connected successfully.
            </p>
            <Button className="mt-6 w-full" onClick={() => router.push('/integrations')}>
              Back to Integrations
            </Button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Connection Failed</h2>
            <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/integrations')}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => router.push('/integrations')}>
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
