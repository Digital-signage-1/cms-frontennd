'use client'

import { useMemo } from 'react'

interface HtmlRendererProps {
  config: {
    html: string
    css?: string
  }
  onError?: (error: Error) => void
}

export function HtmlRenderer({
  config,
  onError,
}: HtmlRendererProps) {
  const { html, css } = config

  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
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
            }
            ${css || ''}
          </style>
        </head>
        <body>
          ${html || ''}
        </body>
      </html>
    `
  }, [html, css])

  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
        <span className="text-sm">No HTML content</span>
      </div>
    )
  }

  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      onError={() => onError?.(new Error('Failed to render HTML'))}
    />
  )
}
