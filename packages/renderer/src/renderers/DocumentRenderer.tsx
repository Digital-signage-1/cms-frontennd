'use client'

interface DocumentRendererProps {
  config: Record<string, any>
  contentUrl?: string
  onError?: (error: Error) => void
  onLoad?: () => void
}

export function DocumentRenderer({ config, contentUrl, onLoad }: DocumentRendererProps) {
  if (onLoad) setTimeout(onLoad, 0)
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-300 p-4">
      <svg className="w-16 h-16 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm font-medium">Word document</span>
      {contentUrl && (
        <a
          href={contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs text-blue-400 hover:underline"
        >
          Open file
        </a>
      )}
    </div>
  )
}
