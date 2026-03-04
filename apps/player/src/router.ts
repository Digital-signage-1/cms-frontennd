export type Route =
  | { type: 'pairing' }
  | { type: 'player'; playerId: string }

export function parseRoute(): Route {
  const path = window.location.pathname
  const match = path.match(/^\/player\/([^/]+)/)
  if (match) {
    return { type: 'player', playerId: match[1] }
  }
  return { type: 'pairing' }
}

export function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

export function navigateToPlayer(playerId: string, token: string): void {
  window.location.href = `/player/${playerId}?token=${encodeURIComponent(token)}`
}
