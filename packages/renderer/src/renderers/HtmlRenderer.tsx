'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'

const FONT_FAMILY_MAP: Record<string, string> = {
  system:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  roboto: 'Roboto, "Helvetica Neue", Arial, sans-serif',
  'open-sans': '"Open Sans", "Helvetica Neue", Arial, sans-serif',
  montserrat: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
  lato: 'Lato, "Helvetica Neue", Arial, sans-serif',
  poppins: 'Poppins, "Helvetica Neue", Arial, sans-serif',
}

interface HtmlRendererProps {
  config: {
    // Support both naming conventions (backend uses snake_case with _content suffix)
    html_content?: string
    html?: string
    css_content?: string
    css?: string
    js_content?: string
    js?: string
    background_color?: string
    font_family?: string
    text_color?: string
    refresh_interval?: number
    sandbox?: boolean
    allow_scripts?: boolean
  }
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function HtmlRenderer({
  config,
  onError,
  onLoad,
}: HtmlRendererProps) {
  const [key, setKey] = useState(0)
  const [error, setError] = useState(false)

  // Normalize field names: accept both `html` and `html_content`
  const htmlContent = config.html_content ?? config.html ?? ''
  const cssContent = config.css_content ?? config.css ?? ''
  const jsContent = config.js_content ?? config.js ?? ''
  const backgroundColor = config.background_color ?? '#000000'
  const textColor = config.text_color ?? '#ffffff'
  const fontFamily = config.font_family ?? 'system'
  const refreshInterval = config.refresh_interval ?? 0
  const isSandboxed = config.sandbox !== false // default true
  const allowScripts = config.allow_scripts !== false // default true

  const fontStack = FONT_FAMILY_MAP[fontFamily] || FONT_FAMILY_MAP.system

  // Auto-refresh support
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return

    const interval = setInterval(() => {
      setKey((prev: number) => prev + 1)
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [refreshInterval])

  // Build the sandbox attribute string
  const sandboxAttr = useMemo(() => {
    if (!isSandboxed) return undefined
    const permissions = ['allow-same-origin']
    if (allowScripts) permissions.push('allow-scripts')
    return permissions.join(' ')
  }, [isSandboxed, allowScripts])

  // Build the full HTML document for the iframe
  const srcDoc = useMemo(() => {
    // Wrap JS in a try/catch + error reporter so iframe JS errors
    // are caught and surfaced via postMessage
    const wrappedJs = jsContent
      ? `
      <script>
        window.addEventListener('DOMContentLoaded', function() {
          try {
            ${jsContent}
          } catch (e) {
            window.parent.postMessage({ type: '__html_renderer_error__', message: String(e) }, '*');
          }
        });
        window.onerror = function(msg) {
          window.parent.postMessage({ type: '__html_renderer_error__', message: String(msg) }, '*');
        };
      </script>`
      : ''

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html, body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: ${backgroundColor};
        color: ${textColor};
        font-family: ${fontStack};
      }
      ${cssContent}
    </style>
  </head>
  <body>
    ${htmlContent}
    ${wrappedJs}
  </body>
</html>`
  }, [htmlContent, cssContent, jsContent, backgroundColor, textColor, fontStack])

  // Listen for JS errors from the iframe via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === '__html_renderer_error__') {
        setError(true)
        onError?.(new Error(`HTML widget JS error: ${event.data.message}`))
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onError])

  const handleLoad = useCallback(() => {
    setError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setError(true)
    onError?.(new Error('Failed to render HTML content'))
  }, [onError])

  if (!htmlContent) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-gray-400"
        style={{ backgroundColor }}
      >
        <span className="text-sm">No HTML content</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-900/80 text-red-200 text-xs px-2 py-1 z-10">
          An error occurred in the HTML content
        </div>
      )}
      <iframe
        key={key}
        srcDoc={srcDoc}
        className="w-full h-full border-0"
        sandbox={sandboxAttr}
        onLoad={handleLoad}
        onError={handleError}
        title="Custom HTML content"
      />
    </div>
  )
}
