'use client'

import { useState, useEffect } from 'react'

interface ClockRendererProps {
  config: {
    format?: '12h' | '24h'
    show_seconds?: boolean
    show_date?: boolean
    timezone?: string
    theme?: 'light' | 'dark' | 'minimal'
  }
}

export function ClockRenderer({ config }: ClockRendererProps) {
  const [time, setTime] = useState(new Date())

  const {
    format = '24h',
    show_seconds = true,
    show_date = true,
    timezone,
    theme = 'dark',
  } = config

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: format === '12h',
    }

    if (show_seconds) {
      options.second = '2-digit'
    }

    if (timezone) {
      options.timeZone = timezone
    }

    return date.toLocaleTimeString('en-US', options)
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }

    if (timezone) {
      options.timeZone = timezone
    }

    return date.toLocaleDateString('en-US', options)
  }

  const themeStyles = {
    light: {
      background: 'bg-white',
      text: 'text-gray-900',
      subtext: 'text-gray-500',
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-white',
      subtext: 'text-gray-400',
    },
    minimal: {
      background: 'bg-transparent',
      text: 'text-white',
      subtext: 'text-white/70',
    },
  }

  const styles = themeStyles[theme]

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${styles.background}`}>
      <div className={`text-6xl font-light tracking-tight ${styles.text}`}>
        {formatTime(time)}
      </div>
      {show_date && (
        <div className={`mt-4 text-xl ${styles.subtext}`}>
          {formatDate(time)}
        </div>
      )}
    </div>
  )
}
