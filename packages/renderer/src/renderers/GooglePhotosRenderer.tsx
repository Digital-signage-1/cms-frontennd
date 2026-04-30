'use client'

import { useState, useEffect, useRef, useMemo, CSSProperties } from 'react'
import { useAutoScroll } from '../hooks/useAutoScroll'

interface PhotoItem {
  url: string
  width?: number
  height?: number
  caption?: string
  filename?: string
}

interface GooglePhotosConfig {
  album_id: string
  transition?: 'fade' | 'slide' | 'zoom' | 'none'
  duration_seconds?: number
  shuffle?: boolean
  fit_mode?: 'cover' | 'contain'
  show_caption?: boolean
  display_mode?: 'slideshow' | 'grid'
  auto_scroll?: boolean
  scroll_speed?: 'slow' | 'medium' | 'fast'
  refresh_interval?: number
  _data?: { photos: PhotoItem[] }
}

interface GooglePhotosRendererProps {
  config: GooglePhotosConfig
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function GooglePhotosRenderer({ config }: GooglePhotosRendererProps) {
  const {
    transition = 'fade',
    duration_seconds = 5,
    shuffle = false,
    fit_mode = 'cover',
    show_caption = false,
    display_mode = 'slideshow',
    auto_scroll = false,
    scroll_speed = 'medium',
    _data,
  } = config

  const scrollRef = useAutoScroll({
    autoScroll: display_mode === 'grid' && auto_scroll,
    scrollSpeed: scroll_speed,
  })

  const rawPhotos = _data?.photos || []
  const photos = useMemo(
    () => (shuffle ? shuffleArray(rawPhotos) : rawPhotos),
    [rawPhotos, shuffle]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (photos.length <= 1 || display_mode === 'grid') return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % photos.length)
        setIsTransitioning(false)
      }, 600)
    }, duration_seconds * 1000)
    return () => clearInterval(interval)
  }, [photos.length, duration_seconds])

  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  }

  if (!photos.length) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No photos available
      </div>
    )
  }

  if (display_mode === 'grid') {
    return (
      <div ref={scrollRef} style={{ ...containerStyle, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px', padding: '4px' }}>
          {photos.map((p, i) => (
            <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
              <img
                src={p.url}
                alt={p.caption || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {show_caption && p.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px',
                  background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {p.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const photo = photos[currentIndex]
  const getTransitionStyle = (): CSSProperties => {
    switch (transition) {
      case 'fade':
        return { opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.6s ease-in-out' }
      case 'zoom':
        return {
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(1.1)' : 'scale(1)',
          transition: 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out',
        }
      case 'slide':
        return {
          transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.6s ease-in-out',
        }
      default:
        return {}
    }
  }

  return (
    <div style={containerStyle}>
      <img
        key={currentIndex}
        src={photo.url}
        alt={photo.caption || photo.filename || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit_mode,
          position: 'absolute',
          top: 0,
          left: 0,
          ...getTransitionStyle(),
        }}
      />
      {show_caption && photo.caption && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: '#fff',
          fontSize: '0.875rem',
        }}>
          {photo.caption}
        </div>
      )}
    </div>
  )
}
