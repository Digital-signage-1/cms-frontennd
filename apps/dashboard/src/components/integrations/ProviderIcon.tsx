import React from 'react'

export const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 p-1 bg-white rounded shadow-sm border border-border/50">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  ),
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
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#E97B3C" />
      <g transform="translate(3.5 3.5) scale(0.708)" fill="white">
        <path d="M11.654.174V2.377H9.682v.58h1.972V5.16h.696V2.957h1.97v-.58h-1.97V.174h-.348zm6.03 2.262l-.002 1.623v1.623h-2.957v.927h2.957v3.188H18.725l.011-1.582.02-1.576 1.465-.02 1.46-.01v-.927H18.728V2.436h-.522zm-12.407.06V5.686H2.291v.925H5.277V9.801h.985V6.61h3.013v-.925H6.262V2.496H5.77zm6.086 5.27v3.593H8.06v1.188h3.304v3.596h1.28v-3.596H15.953v-1.188H12.643V7.766h-.637zm9.721 1.55v2.221h-2.012v.811h2.012v2.261h.887v-2.261H24v-.811h-2.029V9.317h-.422zm-19.111.131V11.621H0v.621H1.973v2.194H2.64v-2.194h2v-.62H2.609V9.446h-.318zm15.709 4.516v3.254h-3.016v.927h3.016v3.217h1.072v-3.216H21.74v-.928H18.754v-3.254h-.533zm-12.463.008v3.246H2.262v.928h2.957v3.189H6.32v-3.189h2.955v-.928H6.32V13.97h-.55zm6.316 4.578l.002 1.103v1.1H9.566v.812h1.971v2.262h.928l.012-1.119.017-1.143H14.463v-.812h-2V18.549h-.465z" />
      </g>
    </svg>
  ),
  slack: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#4A154B" />
      <g transform="translate(4 4) scale(0.666)" fill="white">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </g>
    </svg>
  ),
  salesforce_v2: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#00A1E0" />
      <g transform="translate(3 3) scale(0.75)" fill="white">
        <path d="M10.006 5.415a4.195 4.195 0 013.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.176 5.22c-.345 0-.69-.044-1.02-.104a3.75 3.75 0 01-3.3 1.95c-.6 0-1.155-.15-1.65-.375A4.314 4.314 0 018.88 20.4a4.302 4.302 0 01-4.05-2.82c-.27.062-.54.076-.825.076-2.204 0-4.005-1.8-4.005-4.05 0-1.5.811-2.805 2.01-3.51-.255-.57-.39-1.2-.39-1.846 0-2.58 2.1-4.65 4.65-4.65 1.53 0 2.85.705 3.72 1.8" />
      </g>
    </svg>
  ),
  canva: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#00C4CC" />
      <g transform="translate(4.5 4.5) scale(0.625)" fill="white">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM6.962 7.68c.754 0 1.337.549 1.405 1.2.069.583-.171 1.097-.822 1.406-.343.171-.48.172-.549.069-.034-.069 0-.137.069-.206.617-.514.617-.926.548-1.508-.034-.378-.308-.618-.583-.618-1.2 0-2.914 2.674-2.674 4.629.103.754.549 1.646 1.509 1.646.308 0 .65-.103.96-.24.5-.264.799-.47 1.097-.8-.073-.885.704-2.046 1.851-2.046.515 0 .926.205.96.583.068.514-.377.582-.514.582s-.378-.034-.378-.17c-.034-.138.309-.07.275-.378-.035-.206-.24-.274-.446-.274-.72 0-1.131.994-1.029 1.611.035.275.172.549.447.549.205 0 .514-.31.617-.755.068-.308.343-.514.583-.514.102 0 .17.034.205.171v.138c-.034.137-.137.548-.102.651 0 .069.034.171.17.171.092 0 .436-.18.777-.459.117-.59.253-1.298.253-1.357.034-.24.137-.48.617-.48.103 0 .171.034.205.171v.138l-.136.617c.445-.583 1.097-.994 1.508-.994.172 0 .309.102.309.274 0 .103 0 .274-.069.446-.137.377-.309.96-.412 1.474 0 .137.035.274.207.274.171 0 .685-.206 1.096-.754l.007-.004c-.002-.068-.007-.134-.007-.202 0-.411.035-.754.104-.994.068-.274.411-.514.617-.514.103 0 .205.069.205.171 0 .035 0 .103-.034.137-.137.446-.24.857-.24 1.269 0 .24.034.582.102.788 0 .034.035.069.07.069.068 0 .548-.445.89-1.028-.308-.206-.48-.549-.48-.96 0-.72.446-1.097.858-1.097.343 0 .617.24.617.72 0 .308-.103.65-.274.96h.102a.77.77 0 0 0 .584-.24.293.293 0 0 1 .134-.117c.335-.425.83-.74 1.41-.74.48 0 .924.205.959.582.068.515-.378.618-.515.618l-.002-.002c-.138 0-.377-.035-.377-.172 0-.137.309-.068.274-.376-.034-.206-.24-.275-.446-.275-.686 0-1.13.891-1.028 1.611.034.275.171.583.445.583.206 0 .515-.308.652-.754.068-.274.343-.514.583-.514.103 0 .17.034.205.171 0 .069 0 .206-.137.652-.17.308-.171.48-.137.617.034.274.171.48.309.583.034.034.068.102.068.102 0 .069-.034.138-.137.138-.034 0-.068 0-.103-.035-.514-.205-.72-.548-.789-.891-.205.24-.445.377-.72.377-.445 0-.89-.411-.96-.926a1.609 1.609 0 0 1 .075-.649c-.203.13-.422.203-.623.203h-.17c-.447.652-.927 1.098-1.27 1.303a.896.896 0 0 1-.377.104c-.068 0-.171-.035-.205-.104-.095-.152-.156-.392-.193-.667-.481.527-1.145.805-1.453.805-.343 0-.548-.206-.582-.55v-.376c.102-.754.377-1.2.377-1.337a.074.074 0 0 0-.069-.07c-.24 0-1.028.824-1.166 1.373l-.103.445c-.068.309-.377.515-.582.515-.103 0-.172-.035-.206-.172v-.137l.046-.233c-.435.31-.87.508-1.075.508-.308 0-.48-.172-.514-.412-.206.274-.445.412-.754.412-.352 0-.696-.24-.862-.593-.244.275-.523.553-.852.764-.48.309-1.028.549-1.68.549-.582 0-1.097-.309-1.371-.583-.412-.377-.651-.96-.686-1.509-.205-1.68.823-3.84 2.4-4.8.378-.205.755-.343 1.132-.343zm9.77 3.291c-.104 0-.172.172-.172.343 0 .274.137.583.309.755a1.74 1.74 0 0 0 .102-.583c0-.343-.137-.515-.24-.515z" />
      </g>
    </svg>
  ),
  eventbrite: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#F05537" />
      <g transform="translate(4.5 4.5) scale(0.625)" fill="white">
        <path d="M10.542 5.81c2.653-.6 5.3.487 6.775 2.54L5.591 11c.405-2.479 2.298-4.591 4.951-5.19zm6.84 9.746a6.47 6.47 0 0 1-3.919 2.634c-2.67.604-5.335-.501-6.804-2.582l11.763-2.657 1.915-.433L24 11.691a11.57 11.57 0 0 0-.305-2.333C22.205 3.04 15.76-.9 9.303.558 2.846 2.017-1.18 8.322.31 14.642c1.491 6.319 7.935 10.259 14.392 8.8 3.805-.86 6.765-3.402 8.25-6.638z" />
      </g>
    </svg>
  ),
  finnhub: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
      <rect width="24" height="24" rx="4" fill="#131722" />
      <path d="M6 16l4-4 3 3 5-5" stroke="#26A69A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="10" r="1.5" fill="#26A69A" />
    </svg>
  ),
}

// Aliases
PROVIDER_ICONS['salesforce'] = PROVIDER_ICONS['salesforce_v2']
PROVIDER_ICONS['salesforce_jwt'] = PROVIDER_ICONS['salesforce_v2']

interface ProviderIconProps {
  provider: string
  className?: string
}

export function ProviderIcon({ provider, className = '' }: ProviderIconProps) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-alt ${className}`}>
      {PROVIDER_ICONS[provider] ?? (
        <span className="text-base font-bold text-text-muted uppercase">
          {provider.slice(0, 2)}
        </span>
      )}
    </div>
  )
}
