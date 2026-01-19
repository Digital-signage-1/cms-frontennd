'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Player } from '@signage/types'

// Extended player interface with optional location data
interface PlayerWithLocation extends Player {
  location?: {
    lat: number
    lng: number
    address?: string
    city?: string
    country?: string
  }
}

interface PlayerMapProps {
  players: PlayerWithLocation[]
  onPlayerClick?: (player: PlayerWithLocation) => void
}

const getMarkerColor = (status: string) => {
  // Use design system colors by reading from CSS custom properties
  if (typeof window === 'undefined') return '#6b7280'

  const root = getComputedStyle(document.documentElement)
  const colors: Record<string, string> = {
    online: root.getPropertyValue('--color-success').trim() || '#059669',
    offline: root.getPropertyValue('--color-error').trim() || '#dc2626',
    pending: root.getPropertyValue('--color-warning').trim() || '#d97706',
  }
  return colors[status] || (root.getPropertyValue('--color-text-muted').trim() || '#6b7280')
}

const createCustomIcon = (status: string) => {
  const color = getMarkerColor(status)
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${status === 'online' ? '●' : status === 'offline' ? '○' : '◐'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

export function PlayerMap({ players, onPlayerClick }: PlayerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView([20, 0], 2)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const playersWithLocation = players.filter(p => p.location?.lat && p.location?.lng)

    if (playersWithLocation.length === 0) return

    playersWithLocation.forEach(player => {
      if (!player.location?.lat || !player.location?.lng) return

      const marker = L.marker(
        [player.location.lat, player.location.lng],
        { icon: createCustomIcon(player.status) }
      )

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">${player.name}</h3>
          <div style="font-size: 12px; color: ${getComputedStyle(document.documentElement).getPropertyValue('--color-text-muted').trim() || '#6b7280'};">
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${getMarkerColor(player.status)};">${player.status}</span></p>
            <p style="margin: 4px 0;"><strong>Type:</strong> ${player.device_type}</p>
            ${player.location.address ? `<p style="margin: 4px 0;"><strong>Location:</strong> ${player.location.address}</p>` : ''}
            ${player.location.city ? `<p style="margin: 4px 0;">${player.location.city}${player.location.country ? `, ${player.location.country}` : ''}</p>` : ''}
            ${player.last_seen_at ? `<p style="margin: 4px 0;"><strong>Last Seen:</strong> ${new Date(player.last_seen_at).toLocaleString()}</p>` : ''}
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.on('click', () => {
        onPlayerClick?.(player)
      })

      marker.addTo(mapInstanceRef.current!)
      markersRef.current.push(marker)
    })

    if (playersWithLocation.length > 0) {
      const bounds = L.latLngBounds(
        playersWithLocation.map(p => [p.location!.lat, p.location!.lng])
      )
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [players, onPlayerClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      <div className="absolute top-4 right-4 bg-surface border border-border rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-xs font-semibold text-text-primary mb-2">Legend</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-text-secondary">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span className="text-text-secondary">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-text-secondary">Pending</span>
          </div>
        </div>
      </div>

      {players.filter(p => p.location?.lat && p.location?.lng).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-[999]">
          <div className="text-center">
            <p className="text-text-secondary mb-2">No players with location data</p>
            <p className="text-xs text-text-muted">Add location information to players to see them on the map</p>
          </div>
        </div>
      )}
    </div>
  )
}
