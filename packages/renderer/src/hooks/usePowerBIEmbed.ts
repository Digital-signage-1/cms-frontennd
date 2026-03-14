import { useRef, useEffect, useState, useCallback } from 'react'

type EmbedType = 'report' | 'dashboard'

interface PowerBIEmbedConfig {
  type: EmbedType
  embedUrl: string
  embedToken?: string
  /** 'embed' = GenerateToken embed token, 'aad' = OAuth access token */
  tokenType?: 'embed' | 'aad'
  id: string // report_id or dashboard_id
  tokenExpiry?: string
  filterPaneEnabled?: boolean
  navContentPaneEnabled?: boolean
  pageName?: string
}

interface PowerBIEmbedResult {
  /** true once SDK loads successfully */
  sdkAvailable: boolean
  /** true while SDK is loading */
  sdkLoading: boolean
  /** true once the report has fully loaded (SDK 'loaded' event fired) */
  loaded: boolean
  /** Attach this ref to a <div> — the SDK will render into it */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** The SDK embed object — use for getPages() / setPage() */
  reportRef: React.MutableRefObject<any | null>
}

// Module-level cache so we only attempt the dynamic import once
let sdkPromise: Promise<typeof import('powerbi-client')> | null = null
let sdkModule: typeof import('powerbi-client') | null = null
let sdkFailed = false

function loadSDK(): Promise<typeof import('powerbi-client')> {
  if (sdkModule) return Promise.resolve(sdkModule)
  if (sdkFailed) return Promise.reject(new Error('SDK unavailable'))
  if (!sdkPromise) {
    sdkPromise = import('powerbi-client')
      .then((mod) => {
        sdkModule = mod
        return mod
      })
      .catch((err) => {
        sdkFailed = true
        sdkPromise = null
        throw err
      })
  }
  return sdkPromise
}

export function usePowerBIEmbed(config: PowerBIEmbedConfig): PowerBIEmbedResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkAvailable, setSdkAvailable] = useState(!!sdkModule)
  const [sdkLoading, setSdkLoading] = useState(!sdkModule && !sdkFailed)
  const [loaded, setLoaded] = useState(false)
  const serviceRef = useRef<InstanceType<typeof import('powerbi-client').service.Service> | null>(null)
  const embedRef = useRef<any>(null)

  // Attempt to load the SDK once
  useEffect(() => {
    if (sdkModule || sdkFailed) return
    let cancelled = false
    loadSDK()
      .then(() => {
        if (!cancelled) {
          setSdkAvailable(true)
          setSdkLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSdkAvailable(false)
          setSdkLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  // Embed or update when SDK + config are ready
  const embed = useCallback(() => {
    if (!sdkModule || !containerRef.current || !config.embedUrl || !config.embedToken) return

    const { models, service: { Service }, factories } = sdkModule

    if (!serviceRef.current) {
      serviceRef.current = new Service(
        factories.hpmFactory,
        factories.wpmpFactory,
        factories.routerFactory,
      )
    }

    const pbiService = serviceRef.current!
    const tokenType = config.tokenType === 'aad'
      ? models.TokenType.Aad
      : models.TokenType.Embed

    if (config.type === 'report') {
      const embedConfig: import('powerbi-client').IEmbedConfiguration = {
        type: 'report',
        id: config.id,
        embedUrl: config.embedUrl,
        accessToken: config.embedToken,
        tokenType,
        settings: {
          filterPaneEnabled: config.filterPaneEnabled ?? false,
          navContentPaneEnabled: config.navContentPaneEnabled ?? false,
          background: models.BackgroundType.Transparent,
        },
      }

      if (config.pageName) {
        embedConfig.pageName = config.pageName
      }

      // If already embedded, just refresh the token
      if (embedRef.current) {
        try {
          embedRef.current.setAccessToken(config.embedToken)
        } catch { /* best effort */ }
        return
      }

      embedRef.current = pbiService.embed(containerRef.current, embedConfig)
      setLoaded(false)
      embedRef.current.on('loaded', () => setLoaded(true))
    } else {
      // Dashboard
      const embedConfig: import('powerbi-client').IEmbedConfiguration = {
        type: 'dashboard',
        id: config.id,
        embedUrl: config.embedUrl,
        accessToken: config.embedToken,
        tokenType,
        pageView: 'fitToWidth' as any,
      }

      if (embedRef.current) {
        try {
          embedRef.current.setAccessToken(config.embedToken)
        } catch { /* best effort */ }
        return
      }

      embedRef.current = pbiService.embed(containerRef.current, embedConfig)
      // Dashboards don't support page navigation
    }
  }, [config.type, config.id, config.embedUrl, config.embedToken, config.tokenType, config.filterPaneEnabled, config.navContentPaneEnabled, config.pageName])

  // Run embed when SDK available and config changes
  useEffect(() => {
    if (!sdkAvailable) return
    embed()
  }, [sdkAvailable, embed])

  // Token refresh — when embed_token changes on an existing embed, update it
  useEffect(() => {
    if (!config.embedToken || !embedRef.current) return
    try {
      embedRef.current.setAccessToken(config.embedToken)
    } catch { /* best effort */ }
  }, [config.embedToken])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current && containerRef.current) {
        try {
          serviceRef.current.reset(containerRef.current)
        } catch { /* best effort */ }
      }
      embedRef.current = null
      setLoaded(false)
    }
  }, [])

  return { sdkAvailable, sdkLoading, loaded, containerRef, reportRef: embedRef }
}
